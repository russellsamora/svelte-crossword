var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/Toolbar.svelte generated by Svelte v3.29.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:33) 
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text("Reveal");
    			this.h();
    		},
    		l(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Reveal");
    			button_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(button, "class", "svelte-1f1x93n");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_1*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (10:4) {#if action == 'reset'}
    function create_if_block(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text("Reset");
    			this.h();
    		},
    		l(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Reset");
    			button_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(button, "class", "svelte-1f1x93n");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (9:2) {#each actions as action}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[4] == "reset") return create_if_block;
    		if (/*action*/ ctx[4] == "reveal") return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*actions*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(div, "class", "toolbar svelte-1f1x93n");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*dispatch, actions*/ 3) {
    				each_value = /*actions*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { actions = ["reset", "reveal"] } = $$props;
    	const click_handler = () => dispatch("event", "reset");
    	const click_handler_1 = () => dispatch("event", "reveal");

    	$$self.$$set = $$props => {
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    	};

    	return [actions, dispatch, click_handler, click_handler_1];
    }

    class Toolbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { actions: 0 });
    	}
    }

    var getSecondarilyFocusedCells = ({ cells, focusedDirection, focusedCell }) => {
      const dimension = focusedDirection == "across" ? "x" : "y";
      const otherDimension = focusedDirection == "across" ? "y" : "x";
      const start = focusedCell[dimension];

      const cellsWithDiff = cells
        .filter(
          (cell) =>
            // take out cells in other columns/rows
            cell[otherDimension] == focusedCell[otherDimension]
        )
        .map((cell) => ({
          ...cell,
          // how far is this cell from our focused cell?
          diff: start - cell[dimension],
        }));
        
    	cellsWithDiff.sort((a, b) => a.diff - b.diff);

      // highlight all cells in same row/column, without any breaks
      const diffs = cellsWithDiff.map((d) => d.diff);
      const indices = range(Math.min(...diffs), Math.max(...diffs)).map((i) =>
        diffs.includes(i) ? i : " "
      );
      const chunks = indices.join(",").split(", ,");
      const currentChunk = (
        chunks.find(
          (d) => d.startsWith("0,") || d.endsWith(",0") || d.includes(",0,")
        ) || ""
      )
        .split(",")
        .map((d) => +d);

      const secondarilyFocusedCellIndices = cellsWithDiff
        .filter((cell) => currentChunk.includes(cell.diff))
        .map((cell) => cell.index);
      return secondarilyFocusedCellIndices;
    };

    const range = (min, max) =>
      Array.from({ length: max - min + 1 }, (v, k) => k + min);

    var getCellAfterDiff = ({ diff, cells, direction, focusedCell }) => {
      const dimension = direction == "across" ? "x" : "y";
      const otherDimension = direction == "across" ? "y" : "x";
      const start = focusedCell[dimension];
      const absDiff = Math.abs(diff);
      const isDiffNegative = diff < 0;

      const cellsWithDiff = cells
        .filter(
          (cell) =>
            // take out cells in other columns/rows
            cell[otherDimension] == focusedCell[otherDimension] &&
            // take out cells in wrong direction
            (isDiffNegative ? cell[dimension] < start : cell[dimension] > start)
        )
        .map((cell) => ({
          ...cell,
          // how far is this cell from our focused cell?
          absDiff: Math.abs(start - cell[dimension]),
        }));

      cellsWithDiff.sort((a, b) => a.absDiff - b.absDiff);
      return cellsWithDiff[absDiff - 1];
    };

    /* src/Cell.svelte generated by Svelte v3.29.0 */

    function create_if_block$1(ctx) {
    	let text_1;
    	let t;
    	let text_1_transition;
    	let current;

    	return {
    		c() {
    			text_1 = svg_element("text");
    			t = text(/*value*/ ctx[2]);
    			this.h();
    		},
    		l(nodes) {
    			text_1 = claim_element(
    				nodes,
    				"text",
    				{
    					class: true,
    					x: true,
    					y: true,
    					"dominant-baseline": true,
    					"text-anchor": true
    				},
    				1
    			);

    			var text_1_nodes = children(text_1);
    			t = claim_text(text_1_nodes, /*value*/ ctx[2]);
    			text_1_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(text_1, "class", "value svelte-1fqxzxj");
    			attr(text_1, "x", "0.5");
    			attr(text_1, "y", "0.9");
    			attr(text_1, "dominant-baseline", "auto");
    			attr(text_1, "text-anchor", "middle");
    		},
    		m(target, anchor) {
    			insert(target, text_1, anchor);
    			append(text_1, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*value*/ 4) set_data(t, /*value*/ ctx[2]);
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    					text_1,
    					/*pop*/ ctx[12],
    					{
    						y: 6,
    						delay: /*changeDelay*/ ctx[5],
    						duration: /*isRevealing*/ ctx[6] ? 200 : 0
    					},
    					true
    				);

    				text_1_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    				text_1,
    				/*pop*/ ctx[12],
    				{
    					y: 6,
    					delay: /*changeDelay*/ ctx[5],
    					duration: /*isRevealing*/ ctx[6] ? 200 : 0
    				},
    				false
    			);

    			text_1_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(text_1);
    			if (detaching && text_1_transition) text_1_transition.end();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let g;
    	let rect;
    	let text_1;
    	let t;
    	let g_class_value;
    	let g_transform_value;
    	let g_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*value*/ ctx[2] && create_if_block$1(ctx);

    	return {
    		c() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(/*number*/ ctx[3]);
    			this.h();
    		},
    		l(nodes) {
    			g = claim_element(
    				nodes,
    				"g",
    				{
    					class: true,
    					transform: true,
    					id: true,
    					tabIndex: true
    				},
    				1
    			);

    			var g_nodes = children(g);
    			rect = claim_element(g_nodes, "rect", { width: true, height: true, class: true }, 1);
    			children(rect).forEach(detach);
    			if (if_block) if_block.l(g_nodes);

    			text_1 = claim_element(
    				g_nodes,
    				"text",
    				{
    					class: true,
    					x: true,
    					y: true,
    					"dominant-baseline": true,
    					"text-anchor": true
    				},
    				1
    			);

    			var text_1_nodes = children(text_1);
    			t = claim_text(text_1_nodes, /*number*/ ctx[3]);
    			text_1_nodes.forEach(detach);
    			g_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(rect, "width", "1");
    			attr(rect, "height", "1");
    			attr(rect, "class", "svelte-1fqxzxj");
    			attr(text_1, "class", "number svelte-1fqxzxj");
    			attr(text_1, "x", "0.1");
    			attr(text_1, "y", "0.1");
    			attr(text_1, "dominant-baseline", "hanging");
    			attr(text_1, "text-anchor", "start");
    			attr(g, "class", g_class_value = "cell " + /*custom*/ ctx[4] + " svelte-1fqxzxj");
    			attr(g, "transform", g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`);
    			attr(g, "id", g_id_value = "cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1]);
    			attr(g, "tabindex", "0");
    			toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			append(g, rect);
    			if (if_block) if_block.m(g, null);
    			append(g, text_1);
    			append(text_1, t);
    			/*g_binding*/ ctx[20](g);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(g, "click", /*onClick*/ ctx[11]),
    					listen(g, "keydown", /*onKeydown*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*value*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(g, text_1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*number*/ 8) set_data(t, /*number*/ ctx[3]);

    			if (!current || dirty & /*custom*/ 16 && g_class_value !== (g_class_value = "cell " + /*custom*/ ctx[4] + " svelte-1fqxzxj")) {
    				attr(g, "class", g_class_value);
    			}

    			if (!current || dirty & /*x, y*/ 3 && g_transform_value !== (g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`)) {
    				attr(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*x, y*/ 3 && g_id_value !== (g_id_value = "cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1])) {
    				attr(g, "id", g_id_value);
    			}

    			if (dirty & /*custom, isFocused*/ 144) {
    				toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			}

    			if (dirty & /*custom, isSecondarilyFocused*/ 272) {
    				toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			if (if_block) if_block.d();
    			/*g_binding*/ ctx[20](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { x } = $$props;
    	let { y } = $$props;
    	let { value } = $$props;
    	let { number } = $$props;
    	let { index } = $$props;
    	let { custom } = $$props;
    	let { changeDelay = 0 } = $$props;
    	let { isRevealing = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { isSecondarilyFocused = false } = $$props;

    	let { onFocusCell = () => {
    		
    	} } = $$props;

    	let { onCellUpdate = () => {
    		
    	} } = $$props;

    	let { onFocusClueDiff = () => {
    		
    	} } = $$props;

    	let { onMoveFocus = () => {
    		
    	} } = $$props;

    	let { onFlipDirection = () => {
    		
    	} } = $$props;

    	let { onHistoricalChange = () => {
    		
    	} } = $$props;

    	let element;

    	const onFocusSelf = () => {
    		if (!element) return;
    		if (isFocused) element.focus();
    	};

    	const onKeydown = e => {
    		if (e.ctrlKey && e.key.toLowerCase() == "z") {
    			onHistoricalChange(e.shiftKey ? 1 : -1);
    		}

    		if (e.ctrlKey) return;
    		if (e.altKey) return;

    		if (e.key === "Tab") {
    			onFocusClueDiff(e.shiftKey ? -1 : 1);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (e.key == " ") {
    			onFlipDirection();
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (["Delete", "Backspace"].includes(e.key)) {
    			onCellUpdate(index, "", -1);
    			return;
    		}

    		const isKeyInAlphabet = (/^[a-zA-Z()]$/).test(e.key);

    		if (isKeyInAlphabet) {
    			onCellUpdate(index, e.key.toUpperCase());
    			return;
    		}

    		const diff = ({
    			ArrowLeft: ["across", -1],
    			ArrowRight: ["across", 1],
    			ArrowUp: ["down", -1],
    			ArrowDown: ["down", 1]
    		})[e.key];

    		if (diff) {
    			onMoveFocus(...diff);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}
    	};

    	const onClick = () => {
    		onFocusCell(index);
    	};

    	const pop = (node, { delay = 0, duration = 200 }) => ({
    		delay,
    		duration,
    		css: t => [`transform: translate(0, ${1 - t}px)`].join(";"), //
    		
    	});

    	function g_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("number" in $$props) $$invalidate(3, number = $$props.number);
    		if ("index" in $$props) $$invalidate(13, index = $$props.index);
    		if ("custom" in $$props) $$invalidate(4, custom = $$props.custom);
    		if ("changeDelay" in $$props) $$invalidate(5, changeDelay = $$props.changeDelay);
    		if ("isRevealing" in $$props) $$invalidate(6, isRevealing = $$props.isRevealing);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    		if ("isSecondarilyFocused" in $$props) $$invalidate(8, isSecondarilyFocused = $$props.isSecondarilyFocused);
    		if ("onFocusCell" in $$props) $$invalidate(14, onFocusCell = $$props.onFocusCell);
    		if ("onCellUpdate" in $$props) $$invalidate(15, onCellUpdate = $$props.onCellUpdate);
    		if ("onFocusClueDiff" in $$props) $$invalidate(16, onFocusClueDiff = $$props.onFocusClueDiff);
    		if ("onMoveFocus" in $$props) $$invalidate(17, onMoveFocus = $$props.onMoveFocus);
    		if ("onFlipDirection" in $$props) $$invalidate(18, onFlipDirection = $$props.onFlipDirection);
    		if ("onHistoricalChange" in $$props) $$invalidate(19, onHistoricalChange = $$props.onHistoricalChange);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isFocused*/ 128) {
    			 (onFocusSelf());
    		}
    	};

    	return [
    		x,
    		y,
    		value,
    		number,
    		custom,
    		changeDelay,
    		isRevealing,
    		isFocused,
    		isSecondarilyFocused,
    		element,
    		onKeydown,
    		onClick,
    		pop,
    		index,
    		onFocusCell,
    		onCellUpdate,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onHistoricalChange,
    		g_binding
    	];
    }

    class Cell extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			x: 0,
    			y: 1,
    			value: 2,
    			number: 3,
    			index: 13,
    			custom: 4,
    			changeDelay: 5,
    			isRevealing: 6,
    			isFocused: 7,
    			isSecondarilyFocused: 8,
    			onFocusCell: 14,
    			onCellUpdate: 15,
    			onFocusClueDiff: 16,
    			onMoveFocus: 17,
    			onFlipDirection: 18,
    			onHistoricalChange: 19
    		});
    	}
    }

    /* src/Puzzle.svelte generated by Svelte v3.29.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i].x;
    	child_ctx[25] = list[i].y;
    	child_ctx[26] = list[i].value;
    	child_ctx[27] = list[i].index;
    	child_ctx[28] = list[i].number;
    	child_ctx[29] = list[i].custom;
    	return child_ctx;
    }

    // (140:4) {#each cells as { x, y, value, index, number, custom }}
    function create_each_block$1(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				x: /*x*/ ctx[24],
    				y: /*y*/ ctx[25],
    				index: /*index*/ ctx[27],
    				value: /*value*/ ctx[26],
    				number: /*number*/ ctx[28],
    				custom: /*custom*/ ctx[29],
    				changeDelay: /*isRevealing*/ ctx[2]
    				? /*revealDuration*/ ctx[4] / /*cells*/ ctx[0].length * /*index*/ ctx[27]
    				: 0,
    				isRevealing: /*isRevealing*/ ctx[2],
    				isFocused: /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[27] && !/*isDisableHighlight*/ ctx[3],
    				isSecondarilyFocused: /*secondarilyFocusedCells*/ ctx[5].includes(/*index*/ ctx[27]) && !/*isDisableHighlight*/ ctx[3],
    				onFocusCell: /*onFocusCell*/ ctx[10],
    				onCellUpdate: /*onCellUpdate*/ ctx[8],
    				onFocusClueDiff: /*onFocusClueDiff*/ ctx[11],
    				onMoveFocus: /*onMoveFocus*/ ctx[12],
    				onFlipDirection: /*onFlipDirection*/ ctx[13],
    				onHistoricalChange: /*onHistoricalChange*/ ctx[9]
    			}
    		});

    	return {
    		c() {
    			create_component(cell.$$.fragment);
    		},
    		l(nodes) {
    			claim_component(cell.$$.fragment, nodes);
    		},
    		m(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty[0] & /*cells*/ 1) cell_changes.x = /*x*/ ctx[24];
    			if (dirty[0] & /*cells*/ 1) cell_changes.y = /*y*/ ctx[25];
    			if (dirty[0] & /*cells*/ 1) cell_changes.index = /*index*/ ctx[27];
    			if (dirty[0] & /*cells*/ 1) cell_changes.value = /*value*/ ctx[26];
    			if (dirty[0] & /*cells*/ 1) cell_changes.number = /*number*/ ctx[28];
    			if (dirty[0] & /*cells*/ 1) cell_changes.custom = /*custom*/ ctx[29];

    			if (dirty[0] & /*isRevealing, revealDuration, cells*/ 21) cell_changes.changeDelay = /*isRevealing*/ ctx[2]
    			? /*revealDuration*/ ctx[4] / /*cells*/ ctx[0].length * /*index*/ ctx[27]
    			: 0;

    			if (dirty[0] & /*isRevealing*/ 4) cell_changes.isRevealing = /*isRevealing*/ ctx[2];
    			if (dirty[0] & /*focusedCellIndex, cells, isDisableHighlight*/ 11) cell_changes.isFocused = /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[27] && !/*isDisableHighlight*/ ctx[3];
    			if (dirty[0] & /*secondarilyFocusedCells, cells, isDisableHighlight*/ 41) cell_changes.isSecondarilyFocused = /*secondarilyFocusedCells*/ ctx[5].includes(/*index*/ ctx[27]) && !/*isDisableHighlight*/ ctx[3];
    			cell.$set(cell_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let section;
    	let svg;
    	let svg_viewBox_value;
    	let current;
    	let each_value = /*cells*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			section = element("section");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l(nodes) {
    			section = claim_element(nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			svg = claim_element(section_nodes, "svg", { viewBox: true, class: true }, 1);
    			var svg_nodes = children(svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(svg_nodes);
    			}

    			svg_nodes.forEach(detach);
    			section_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(svg, "viewBox", svg_viewBox_value = "0 0 " + /*w*/ ctx[6] + " " + /*h*/ ctx[7]);
    			attr(svg, "class", "svelte-td5hz8");
    			attr(section, "class", "puzzle svelte-td5hz8");
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);
    			append(section, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*cells, isRevealing, revealDuration, focusedCellIndex, isDisableHighlight, secondarilyFocusedCells, onFocusCell, onCellUpdate, onFocusClueDiff, onMoveFocus, onFlipDirection, onHistoricalChange*/ 16191) {
    				each_value = /*cells*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const numberOfStatesInHistory = 10;

    function instance$2($$self, $$props, $$invalidate) {
    	let { clues } = $$props;
    	let { cells } = $$props;
    	let { focusedDirection } = $$props;
    	let { focusedCellIndex } = $$props;
    	let { focusedCell } = $$props;
    	let { isRevealing } = $$props;
    	let { isDisableHighlight } = $$props;
    	let { revealDuration = 0 } = $$props;
    	let cellsHistoryIndex = 0;
    	let cellsHistory = [];
    	let focusedCellIndexHistory = [];
    	const w = Math.max(...cells.map(d => d.x)) + 1;
    	const h = Math.max(...cells.map(d => d.y)) + 1;
    	let secondarilyFocusedCells = [];

    	const updateSecondarilyFocusedCells = () => {
    		$$invalidate(5, secondarilyFocusedCells = getSecondarilyFocusedCells({ cells, focusedDirection, focusedCell }));
    	};

    	const onCellUpdate = (index, newValue, diff = 1) => {
    		const doReplaceFilledCells = !!cells[index].value;

    		const newCells = [
    			...cells.slice(0, index),
    			{ ...cells[index], value: newValue },
    			...cells.slice(index + 1)
    		];

    		cellsHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(0, numberOfStatesInHistory);
    		cellsHistoryIndex = 0;
    		$$invalidate(0, cells = newCells);
    		onFocusCellDiff(diff, doReplaceFilledCells);
    	};

    	const onHistoricalChange = diff => {
    		cellsHistoryIndex += -diff;
    		$$invalidate(0, cells = cellsHistory[cellsHistoryIndex] || cells);
    		$$invalidate(1, focusedCellIndex = focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex);
    	};

    	const onFocusCell = index => {
    		if (index == focusedCellIndex) {
    			onFlipDirection();
    		} else {
    			$$invalidate(1, focusedCellIndex = index);
    			focusedCellIndexHistory = [index, ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory)];
    		}
    	};

    	const onFocusCellDiff = (diff, doReplaceFilledCells = true) => {
    		const sortedCellsInDirectionFiltered = sortedCellsInDirection.filter(d => doReplaceFilledCells ? true : !d.value);
    		const currentCellIndex = sortedCellsInDirectionFiltered.findIndex(d => d.index == focusedCellIndex);
    		const nextCellIndex = (sortedCellsInDirectionFiltered[currentCellIndex + diff] || {}).index;
    		const nextCell = cells[nextCellIndex];
    		if (!nextCell) return;
    		onFocusCell(nextCellIndex);
    	};

    	const onFocusClueDiff = (diff = 1) => {
    		const currentNumber = focusedCell.clueNumbers[focusedDirection];

    		let nextCluesInDirection = clues.filter(clue => (diff > 0
    		? clue.number > currentNumber
    		: clue.number < currentNumber) && clue.direction == focusedDirection);

    		if (diff < 0) {
    			nextCluesInDirection = nextCluesInDirection.reverse();
    		}

    		let nextClue = nextCluesInDirection[Math.abs(diff) - 1];

    		if (!nextClue) {
    			onFlipDirection();
    			nextClue = clues.filter(clue => clue.direction == focusedDirection)[0];
    		}

    		$$invalidate(1, focusedCellIndex = cells.findIndex(cell => cell.x == nextClue.x && cell.y == nextClue.y));
    	};

    	const onMoveFocus = (direction, diff) => {
    		if (focusedDirection != direction) {
    			$$invalidate(14, focusedDirection = direction);
    		} else {
    			const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
    			if (!nextCell) return;
    			onFocusCell(nextCell.index);
    		}
    	};

    	const onFlipDirection = () => {
    		$$invalidate(14, focusedDirection = ({ across: "down", down: "across" })[focusedDirection]);
    	};

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(15, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(0, cells = $$props.cells);
    		if ("focusedDirection" in $$props) $$invalidate(14, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(1, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(16, focusedCell = $$props.focusedCell);
    		if ("isRevealing" in $$props) $$invalidate(2, isRevealing = $$props.isRevealing);
    		if ("isDisableHighlight" in $$props) $$invalidate(3, isDisableHighlight = $$props.isDisableHighlight);
    		if ("revealDuration" in $$props) $$invalidate(4, revealDuration = $$props.revealDuration);
    	};

    	let sortedCellsInDirection;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex, focusedDirection*/ 16387) {
    			 (updateSecondarilyFocusedCells());
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedDirection*/ 16385) {
    			 sortedCellsInDirection = [...cells].sort((a, b) => focusedDirection == "down"
    			? a.x - b.x || a.y - b.y
    			: a.y - b.y || a.x - b.x);
    		}
    	};

    	return [
    		cells,
    		focusedCellIndex,
    		isRevealing,
    		isDisableHighlight,
    		revealDuration,
    		secondarilyFocusedCells,
    		w,
    		h,
    		onCellUpdate,
    		onHistoricalChange,
    		onFocusCell,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		focusedDirection,
    		clues,
    		focusedCell
    	];
    }

    class Puzzle extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				clues: 15,
    				cells: 0,
    				focusedDirection: 14,
    				focusedCellIndex: 1,
    				focusedCell: 16,
    				isRevealing: 2,
    				isDisableHighlight: 3,
    				revealDuration: 4
    			},
    			[-1, -1]
    		);
    	}
    }

    var scrollTo = (node, isFocused) => {
      return {
        update(newIsFocused) {
          isFocused = newIsFocused;
          if (!isFocused) return;
          const list = node.parentElement.parentElement;
          if (!list) return;

          const top = node.offsetTop;
          const currentYTop = list.scrollTop;
          const currentYBottom = currentYTop + list.clientHeight;
          const buffer = 50;
          if (top < currentYTop + buffer || top > currentYBottom - buffer) {
            list.scrollTo({ top: top, behavior: "smooth" });
          }
        },
      };
    };

    /* src/Clue.svelte generated by Svelte v3.29.0 */

    function create_fragment$3(ctx) {
    	let li;
    	let button;
    	let t0;
    	let t1;
    	let t2;
    	let scrollTo_action;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			button = element("button");
    			t0 = text(/*number*/ ctx[0]);
    			t1 = text(".\n    ");
    			t2 = text(/*clue*/ ctx[1]);
    			this.h();
    		},
    		l(nodes) {
    			li = claim_element(nodes, "LI", {});
    			var li_nodes = children(li);
    			button = claim_element(li_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t0 = claim_text(button_nodes, /*number*/ ctx[0]);
    			t1 = claim_text(button_nodes, ".\n    ");
    			t2 = claim_text(button_nodes, /*clue*/ ctx[1]);
    			button_nodes.forEach(detach);
    			li_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(button, "class", "clue svelte-1jz5ixd");
    			toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[3]);
    			toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[4]);
    			toggle_class(button, "is-filled", /*isFilled*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, button);
    			append(button, t0);
    			append(button, t1);
    			append(button, t2);
    			/*li_binding*/ ctx[8](li);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", function () {
    						if (is_function(/*onFocus*/ ctx[5])) /*onFocus*/ ctx[5].apply(this, arguments);
    					}),
    					action_destroyer(scrollTo_action = scrollTo.call(null, li, /*isFocused*/ ctx[7]))
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*number*/ 1) set_data(t0, /*number*/ ctx[0]);
    			if (dirty & /*clue*/ 2) set_data(t2, /*clue*/ ctx[1]);

    			if (dirty & /*isNumberFocused*/ 8) {
    				toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[3]);
    			}

    			if (dirty & /*isDirectionFocused*/ 16) {
    				toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[4]);
    			}

    			if (dirty & /*isFilled*/ 4) {
    				toggle_class(button, "is-filled", /*isFilled*/ ctx[2]);
    			}

    			if (scrollTo_action && is_function(scrollTo_action.update) && dirty & /*isFocused*/ 128) scrollTo_action.update.call(null, /*isFocused*/ ctx[7]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    			/*li_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { number } = $$props;
    	let { clue } = $$props;
    	let { isFilled } = $$props;
    	let { isNumberFocused = false } = $$props;
    	let { isDirectionFocused = false } = $$props;

    	let { onFocus = () => {
    		
    	} } = $$props;

    	let element;

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(6, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("isFilled" in $$props) $$invalidate(2, isFilled = $$props.isFilled);
    		if ("isNumberFocused" in $$props) $$invalidate(3, isNumberFocused = $$props.isNumberFocused);
    		if ("isDirectionFocused" in $$props) $$invalidate(4, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onFocus" in $$props) $$invalidate(5, onFocus = $$props.onFocus);
    	};

    	let isFocused;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isNumberFocused*/ 8) {
    			 $$invalidate(7, isFocused = isNumberFocused);
    		}
    	};

    	return [
    		number,
    		clue,
    		isFilled,
    		isNumberFocused,
    		isDirectionFocused,
    		onFocus,
    		element,
    		isFocused,
    		li_binding
    	];
    }

    class Clue extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			number: 0,
    			clue: 1,
    			isFilled: 2,
    			isNumberFocused: 3,
    			isDirectionFocused: 4,
    			onFocus: 5
    		});
    	}
    }

    /* src/ClueList.svelte generated by Svelte v3.29.0 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (14:4) {#each clues as clue}
    function create_each_block$2(ctx) {
    	let clue;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[5](/*clue*/ ctx[6], ...args);
    	}

    	clue = new Clue({
    			props: {
    				clue: /*clue*/ ctx[6].clue,
    				number: /*clue*/ ctx[6].number,
    				isFilled: /*clue*/ ctx[6].isFilled,
    				isNumberFocused: /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] == /*clue*/ ctx[6].number,
    				isDirectionFocused: /*isDirectionFocused*/ ctx[3],
    				onFocus: func
    			}
    		});

    	return {
    		c() {
    			create_component(clue.$$.fragment);
    		},
    		l(nodes) {
    			claim_component(clue.$$.fragment, nodes);
    		},
    		m(target, anchor) {
    			mount_component(clue, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const clue_changes = {};
    			if (dirty & /*clues*/ 2) clue_changes.clue = /*clue*/ ctx[6].clue;
    			if (dirty & /*clues*/ 2) clue_changes.number = /*clue*/ ctx[6].number;
    			if (dirty & /*clues*/ 2) clue_changes.isFilled = /*clue*/ ctx[6].isFilled;
    			if (dirty & /*focusedClueNumbers, direction, clues*/ 7) clue_changes.isNumberFocused = /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] == /*clue*/ ctx[6].number;
    			if (dirty & /*isDirectionFocused*/ 8) clue_changes.isDirectionFocused = /*isDirectionFocused*/ ctx[3];
    			if (dirty & /*onClueFocus, clues*/ 18) clue_changes.onFocus = func;
    			clue.$set(clue_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(clue.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(clue.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(clue, detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let ul;
    	let current;
    	let each_value = /*clues*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t0 = text(/*direction*/ ctx[0]);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, /*direction*/ ctx[0]);
    			p_nodes.forEach(detach);
    			t1 = claim_space(div_nodes);
    			ul = claim_element(div_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach);
    			div_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(p, "class", "svelte-jdhgl");
    			attr(ul, "class", "svelte-jdhgl");
    			attr(div, "class", "list svelte-jdhgl");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(div, t1);
    			append(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*direction*/ 1) set_data(t0, /*direction*/ ctx[0]);

    			if (dirty & /*clues, focusedClueNumbers, direction, isDirectionFocused, onClueFocus*/ 31) {
    				each_value = /*clues*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { direction } = $$props;
    	let { clues } = $$props;
    	let { focusedClueNumbers } = $$props;
    	let { isDirectionFocused } = $$props;
    	let { onClueFocus } = $$props;
    	const func = clue => onClueFocus(clue);

    	$$self.$$set = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("focusedClueNumbers" in $$props) $$invalidate(2, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("isDirectionFocused" in $$props) $$invalidate(3, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onClueFocus" in $$props) $$invalidate(4, onClueFocus = $$props.onClueFocus);
    	};

    	return [direction, clues, focusedClueNumbers, isDirectionFocused, onClueFocus, func];
    }

    class ClueList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			direction: 0,
    			clues: 1,
    			focusedClueNumbers: 2,
    			isDirectionFocused: 3,
    			onClueFocus: 4
    		});
    	}
    }

    /* src/Clues.svelte generated by Svelte v3.29.0 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (22:2) {#each ['across', 'down'] as direction}
    function create_each_block$3(ctx) {
    	let cluelist;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[7](/*direction*/ ctx[8], ...args);
    	}

    	cluelist = new ClueList({
    			props: {
    				direction: /*direction*/ ctx[8],
    				focusedClueNumbers: /*focusedClueNumbers*/ ctx[2],
    				clues: /*clues*/ ctx[1].filter(func),
    				isDirectionFocused: /*focusedDirection*/ ctx[0] == /*direction*/ ctx[8],
    				onClueFocus: /*onClueFocus*/ ctx[3]
    			}
    		});

    	return {
    		c() {
    			create_component(cluelist.$$.fragment);
    		},
    		l(nodes) {
    			claim_component(cluelist.$$.fragment, nodes);
    		},
    		m(target, anchor) {
    			mount_component(cluelist, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cluelist_changes = {};
    			if (dirty & /*focusedClueNumbers*/ 4) cluelist_changes.focusedClueNumbers = /*focusedClueNumbers*/ ctx[2];
    			if (dirty & /*clues*/ 2) cluelist_changes.clues = /*clues*/ ctx[1].filter(func);
    			if (dirty & /*focusedDirection*/ 1) cluelist_changes.isDirectionFocused = /*focusedDirection*/ ctx[0] == /*direction*/ ctx[8];
    			cluelist.$set(cluelist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(cluelist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(cluelist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(cluelist, detaching);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let section;
    	let current;
    	let each_value = ["across", "down"];
    	let each_blocks = [];

    	for (let i = 0; i < 2; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			section = element("section");

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l(nodes) {
    			section = claim_element(nodes, "SECTION", { class: true });
    			var section_nodes = children(section);

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].l(section_nodes);
    			}

    			section_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(section, "class", "clues svelte-3e790s");
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*focusedClueNumbers, clues, focusedDirection, onClueFocus*/ 15) {
    				each_value = ["across", "down"];
    				let i;

    				for (i = 0; i < 2; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = 2; i < 2; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < 2; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 2; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { clues } = $$props;
    	let { cellIndexMap } = $$props;
    	let { focusedDirection } = $$props;
    	let { focusedCellIndex } = $$props;
    	let { focusedCell } = $$props;

    	const onClueFocus = clue => {
    		$$invalidate(0, focusedDirection = clue.direction);
    		const cellId = [clue.x, clue.y].join("-");
    		$$invalidate(4, focusedCellIndex = cellIndexMap[cellId] || 0);
    	};

    	const func = (direction, d) => d.direction == direction;

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("cellIndexMap" in $$props) $$invalidate(5, cellIndexMap = $$props.cellIndexMap);
    		if ("focusedDirection" in $$props) $$invalidate(0, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(4, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(6, focusedCell = $$props.focusedCell);
    	};

    	let focusedClueNumbers;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focusedCell*/ 64) {
    			 $$invalidate(2, focusedClueNumbers = focusedCell.clueNumbers || {});
    		}
    	};

    	return [
    		focusedDirection,
    		clues,
    		focusedClueNumbers,
    		onClueFocus,
    		focusedCellIndex,
    		cellIndexMap,
    		focusedCell,
    		func
    	];
    }

    class Clues extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			clues: 1,
    			cellIndexMap: 5,
    			focusedDirection: 0,
    			focusedCellIndex: 4,
    			focusedCell: 6
    		});
    	}
    }

    function quadIn(t) {
        return t * t;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Confetti.svelte generated by Svelte v3.29.0 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[9] = list[i][1];
    	child_ctx[10] = list[i][2];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (45:2) {#each allElements as [element, color, scale], i}
    function create_each_block$4(ctx) {
    	let g1;
    	let g0;
    	let raw_value = /*element*/ ctx[8] + "";
    	let g0_fill_value;
    	let g0_style_value;

    	return {
    		c() {
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			this.h();
    		},
    		l(nodes) {
    			g1 = claim_element(nodes, "g", { style: true, class: true }, 1);
    			var g1_nodes = children(g1);
    			g0 = claim_element(g1_nodes, "g", { fill: true, style: true, class: true }, 1);
    			var g0_nodes = children(g0);
    			g0_nodes.forEach(detach);
    			g1_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(g0, "fill", g0_fill_value = /*color*/ ctx[9]);

    			attr(g0, "style", g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"));

    			attr(g0, "class", "svelte-15wt7c8");
    			set_style(g1, "transform", "scale(" + /*scale*/ ctx[10] + ")");
    			attr(g1, "class", "svelte-15wt7c8");
    		},
    		m(target, anchor) {
    			insert(target, g1, anchor);
    			append(g1, g0);
    			g0.innerHTML = raw_value;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*numberOfElements, durationInSeconds*/ 3 && g0_style_value !== (g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"))) {
    				attr(g0, "style", g0_style_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(g1);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let svg;
    	let each_value = /*allElements*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c() {
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { class: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(svg_nodes);
    			}

    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(svg, "class", "confetti svelte-15wt7c8");
    			attr(svg, "viewBox", "-10 -10 10 10");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*allElements, Math, quadIn, numberOfElements, durationInSeconds, randomNumber*/ 15) {
    				each_value = /*allElements*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { numberOfElements = 50 } = $$props;
    	let { durationInSeconds = 2 } = $$props;

    	let { colors = [
    		"#fff",
    		"#c7ecee",
    		"#778beb",
    		"#f7d794",
    		"#63cdda",
    		"#cf6a87",
    		"#e77f67",
    		"#786fa6",
    		"#FDA7DF",
    		"#4b7bec",
    		"#475c83"
    	] } = $$props;

    	const pickFrom = arr => arr[Math.round(Math.random() * arr.length)];
    	const randomNumber = (min, max) => Math.random() * (max - min) + min;
    	const getManyOf = str => new Array(30).fill(0).map(() => str);

    	const elementOptions = [
    		...getManyOf(`<circle r="3" />`),
    		...getManyOf(`<path d="M3.83733 4.73234C4.38961 4.73234 4.83733 4.28463 4.83733 3.73234C4.83733 3.18006 4.38961 2.73234 3.83733 2.73234C3.28505 2.73234 2.83733 3.18006 2.83733 3.73234C2.83733 4.28463 3.28505 4.73234 3.83733 4.73234ZM3.83733 6.73234C5.49418 6.73234 6.83733 5.38919 6.83733 3.73234C6.83733 2.07549 5.49418 0.732341 3.83733 0.732341C2.18048 0.732341 0.83733 2.07549 0.83733 3.73234C0.83733 5.38919 2.18048 6.73234 3.83733 6.73234Z" />`),
    		...getManyOf(`<path d="M4.29742 2.26041C3.86864 2.1688 3.20695 2.21855 2.13614 3.0038C1.69078 3.33041 1.06498 3.23413 0.738375 2.78876C0.411774 2.3434 0.508051 1.7176 0.953417 1.39099C2.32237 0.387097 3.55827 0.0573281 4.71534 0.304565C5.80081 0.536504 6.61625 1.24716 7.20541 1.78276C7.28295 1.85326 7.35618 1.92051 7.4263 1.9849C7.64841 2.18888 7.83929 2.36418 8.03729 2.52315C8.29108 2.72692 8.48631 2.8439 8.64952 2.90181C8.7915 2.95219 8.91895 2.96216 9.07414 2.92095C9.24752 2.8749 9.5134 2.7484 9.88467 2.42214C10.2995 2.05757 10.9314 2.09833 11.2959 2.51319C11.6605 2.92805 11.6198 3.5599 11.2049 3.92447C10.6816 4.38435 10.1478 4.70514 9.58752 4.85394C9.00909 5.00756 8.469 4.95993 7.9807 4.78667C7.51364 4.62093 7.11587 4.34823 6.78514 4.08268C6.53001 3.87783 6.27248 3.64113 6.04114 3.4285C5.97868 3.37109 5.91814 3.31544 5.86006 3.26264C5.25645 2.7139 4.79779 2.36733 4.29742 2.26041Z" />`),
    		...getManyOf(`<rect width="4" height="4" x="-2" y="-2" />`),
    		`<path d="M -5 5 L 0 -5 L 5 5 Z" />`,
    		...("ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("").map(letter => `<text style="font-weight: 700">${letter}</text>`)
    	];

    	const allElements = new Array(numberOfElements).fill(0).map((_, i) => [pickFrom(elementOptions), pickFrom(colors), Math.random()]);

    	$$self.$$set = $$props => {
    		if ("numberOfElements" in $$props) $$invalidate(0, numberOfElements = $$props.numberOfElements);
    		if ("durationInSeconds" in $$props) $$invalidate(1, durationInSeconds = $$props.durationInSeconds);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    	};

    	return [numberOfElements, durationInSeconds, randomNumber, allElements, colors];
    }

    class Confetti extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			numberOfElements: 0,
    			durationInSeconds: 1,
    			colors: 4
    		});
    	}
    }

    /* src/CompletedMessage.svelte generated by Svelte v3.29.0 */

    function create_if_block$2(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let t3;
    	let t4;
    	let div1;
    	let confetti;
    	let div2_transition;
    	let t5;
    	let div3;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	confetti = new Confetti({});

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text("You did it!");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			button = element("button");
    			t3 = text("View puzzle");
    			t4 = space();
    			div1 = element("div");
    			create_component(confetti.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			this.h();
    		},
    		l(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h3 = claim_element(div0_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "You did it!");
    			h3_nodes.forEach(detach);
    			t1 = claim_space(div0_nodes);
    			if (default_slot) default_slot.l(div0_nodes);
    			t2 = claim_space(div0_nodes);
    			button = claim_element(div0_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t3 = claim_text(button_nodes, "View puzzle");
    			button_nodes.forEach(detach);
    			div0_nodes.forEach(detach);
    			t4 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			claim_component(confetti.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach);
    			div2_nodes.forEach(detach);
    			t5 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			children(div3).forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(h3, "class", "svelte-1qq6vh8");
    			attr(button, "class", "svelte-1qq6vh8");
    			attr(div0, "class", "content svelte-1qq6vh8");
    			attr(div1, "class", "confetti svelte-1qq6vh8");
    			attr(div2, "class", "c svelte-1qq6vh8");
    			attr(div3, "class", "background svelte-1qq6vh8");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, h3);
    			append(h3, t0);
    			append(div0, t1);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append(div0, t2);
    			append(div0, button);
    			append(button, t3);
    			append(div2, t4);
    			append(div2, div1);
    			mount_component(confetti, div1, null);
    			insert(target, t5, anchor);
    			insert(target, div3, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*click_handler*/ ctx[3]),
    					listen(div3, "click", /*click_handler_1*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(confetti.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 300 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(confetti.$$.fragment, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 300 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(confetti);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach(t5);
    			if (detaching) detach(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$2(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let isOpen = true;
    	const click_handler = () => $$invalidate(0, isOpen = false);
    	const click_handler_1 = () => $$invalidate(0, isOpen = false);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [isOpen, $$scope, slots, click_handler, click_handler_1];
    }

    class CompletedMessage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
    	}
    }

    function createClues(data) {
      const withId = data.map((d, i) => ({
    		...d,
    		index: i,
        id: `${d.x}-${d.y}`,
      }));
    	
      // sort asc by start position of clue so we have proper clue ordering
      withId.sort((a, b) => a.y - b.y || a.x - b.x);

      // create a lookup to store clue number (and reuse if same start pos)
      let lookup = {};
      let currentNumber = 1;

      const withNumber = withId.map((d) => {
        let number;
        if (lookup[d.id]) number = lookup[d.id];
        else {
          lookup[d.id] = number = currentNumber;
          currentNumber += 1;
        }
        return {
          ...d,
          number,
        };
      });


    	// create cells for each letter
    	const withCells = withNumber.map(d => {
    		const chars = d.answer.split("");
        const cells = chars.map((answer, i) => {
          const x = d.x + (d.direction === "across" ? i : 0);
          const y = d.y + (d.direction === "down" ? i : 0);
          const number = i === 0 ? d.number : "";
          const clueNumbers = { [d.direction]: d.number };
          const id = `${x}-${y}`;
          const value = "";
          const custom = d.custom || "";
          return {
            id,
            number,
            clueNumbers,
            x,
            y,
            value,
            answer: answer.toUpperCase(),
            custom,
          };
        });
    		return {
    			...d,
    			cells
    		}
    	});

    	withCells.sort((a, b) => a.number - b.number);

    	return withCells;
    }

    function createCells(data) {
      const cells = [].concat(...data.map(d => d.cells));
      let dict = {};

      // sort so that ones with number values come first and dedupe
      cells.sort((a, b) => a.y - b.y || a.x - b.x || b.number - a.number);
      cells.forEach((d) => {
        if (!dict[d.id]) {
          dict[d.id] = d;
        } else {
          // consolidate clue numbers for across & down
          dict[d.id].clueNumbers = {
            ...d.clueNumbers,
            ...dict[d.id].clueNumbers,
          };
          // consolidate custom classes
          if (dict[d.id].custom !== d.custom)
            dict[d.id].custom = `${dict[d.id].custom} ${d.custom}`;
        }
      });

      const unique = Object.keys(dict).map((d) => dict[d]);
      unique.sort((a, b) => a.y - b.y || a.x - b.x);
      // add index
      const output = unique.map((d, i) => ({ ...d, index: i }));
      return output;
    }

    function validateClues(data) {
    	const props = [
        {
          prop: "clue",
          type: "string",
        },
        {
          prop: "answer",
          type: "string",
        },
        {
          prop: "x",
          type: "number",
        },
        {
          prop: "y",
          type: "number",
        }
      ];

    	// only store if they fail
    	let failedProp = false;
      data.forEach(d => !!props.map(p => {
    		const f = typeof d[p.prop] !== p.type;
    		if (f) {
    			failedProp = true;
    			console.error(`"${p.prop}" is not a ${p.type}\n`, d);
    		}
    	}));

    	let failedCell = false;
    	const cells = [].concat(...data.map(d => d.cells));
    	
    	let dict = {};
    	cells.forEach((d) => {
        if (!dict[d.id]) {
          dict[d.id] = d.answer;
        } else {
    			if (dict[d.id] !== d.answer) {
    				failedCell = true;
    				console.error(`cell "${d.id}" has two different values\n`, `${dict[d.id]} and ${d.answer}`);
    			}
    		}
      });

    	return !failedProp && !failedCell;
    }

    function fromPairs(arr) {
      let res = {};
      arr.forEach((d) => {
        res[d[0]] = d[1];
      });
      return res;
    }

    /* src/Crossword.svelte generated by Svelte v3.29.0 */
    const get_complete_slot_changes = dirty => ({});
    const get_complete_slot_context = ctx => ({});
    const get_toolbar_slot_changes = dirty => ({});

    const get_toolbar_slot_context = ctx => ({
    	onReset: /*onReset*/ ctx[14],
    	onReveal: /*onReveal*/ ctx[15]
    });

    // (101:0) {#if validated}
    function create_if_block$3(ctx) {
    	let article;
    	let t0;
    	let div;
    	let clues_1;
    	let updating_focusedCellIndex;
    	let updating_focusedCell;
    	let updating_focusedDirection;
    	let t1;
    	let puzzle;
    	let updating_cells;
    	let updating_focusedCellIndex_1;
    	let updating_focusedDirection_1;
    	let t2;
    	let article_class_value;
    	let current;
    	const toolbar_slot_template = /*#slots*/ ctx[21].toolbar;
    	const toolbar_slot = create_slot(toolbar_slot_template, ctx, /*$$scope*/ ctx[28], get_toolbar_slot_context);
    	const toolbar_slot_or_fallback = toolbar_slot || fallback_block(ctx);

    	function clues_1_focusedCellIndex_binding(value) {
    		/*clues_1_focusedCellIndex_binding*/ ctx[22].call(null, value);
    	}

    	function clues_1_focusedCell_binding(value) {
    		/*clues_1_focusedCell_binding*/ ctx[23].call(null, value);
    	}

    	function clues_1_focusedDirection_binding(value) {
    		/*clues_1_focusedDirection_binding*/ ctx[24].call(null, value);
    	}

    	let clues_1_props = {
    		clues: /*clues*/ ctx[3],
    		cellIndexMap: /*cellIndexMap*/ ctx[9]
    	};

    	if (/*focusedCellIndex*/ ctx[6] !== void 0) {
    		clues_1_props.focusedCellIndex = /*focusedCellIndex*/ ctx[6];
    	}

    	if (/*focusedCell*/ ctx[8] !== void 0) {
    		clues_1_props.focusedCell = /*focusedCell*/ ctx[8];
    	}

    	if (/*focusedDirection*/ ctx[5] !== void 0) {
    		clues_1_props.focusedDirection = /*focusedDirection*/ ctx[5];
    	}

    	clues_1 = new Clues({ props: clues_1_props });
    	binding_callbacks.push(() => bind(clues_1, "focusedCellIndex", clues_1_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedCell", clues_1_focusedCell_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedDirection", clues_1_focusedDirection_binding));

    	function puzzle_cells_binding(value) {
    		/*puzzle_cells_binding*/ ctx[25].call(null, value);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		/*puzzle_focusedCellIndex_binding*/ ctx[26].call(null, value);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		/*puzzle_focusedDirection_binding*/ ctx[27].call(null, value);
    	}

    	let puzzle_props = {
    		clues: /*clues*/ ctx[3],
    		focusedCell: /*focusedCell*/ ctx[8],
    		isRevealing: /*isRevealing*/ ctx[7],
    		isDisableHighlight: /*isDisableHighlight*/ ctx[12],
    		revealDuration: /*revealDuration*/ ctx[1]
    	};

    	if (/*cells*/ ctx[4] !== void 0) {
    		puzzle_props.cells = /*cells*/ ctx[4];
    	}

    	if (/*focusedCellIndex*/ ctx[6] !== void 0) {
    		puzzle_props.focusedCellIndex = /*focusedCellIndex*/ ctx[6];
    	}

    	if (/*focusedDirection*/ ctx[5] !== void 0) {
    		puzzle_props.focusedDirection = /*focusedDirection*/ ctx[5];
    	}

    	puzzle = new Puzzle({ props: puzzle_props });
    	binding_callbacks.push(() => bind(puzzle, "cells", puzzle_cells_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedCellIndex", puzzle_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedDirection", puzzle_focusedDirection_binding));
    	let if_block = /*isComplete*/ ctx[10] && !/*isRevealing*/ ctx[7] && /*showCompleteMessage*/ ctx[2] && create_if_block_1$1(ctx);

    	return {
    		c() {
    			article = element("article");
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.c();
    			t0 = space();
    			div = element("div");
    			create_component(clues_1.$$.fragment);
    			t1 = space();
    			create_component(puzzle.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l(nodes) {
    			article = claim_element(nodes, "ARTICLE", { class: true });
    			var article_nodes = children(article);
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.l(article_nodes);
    			t0 = claim_space(article_nodes);
    			div = claim_element(article_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(clues_1.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(puzzle.$$.fragment, div_nodes);
    			div_nodes.forEach(detach);
    			t2 = claim_space(article_nodes);
    			if (if_block) if_block.l(article_nodes);
    			article_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(div, "class", "play svelte-1cndb7v");
    			attr(article, "class", article_class_value = "crossword " + /*themeClass*/ ctx[11] + " svelte-1cndb7v");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);

    			if (toolbar_slot_or_fallback) {
    				toolbar_slot_or_fallback.m(article, null);
    			}

    			append(article, t0);
    			append(article, div);
    			mount_component(clues_1, div, null);
    			append(div, t1);
    			mount_component(puzzle, div, null);
    			append(article, t2);
    			if (if_block) if_block.m(article, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (toolbar_slot) {
    				if (toolbar_slot.p && dirty[0] & /*$$scope*/ 268435456) {
    					update_slot(toolbar_slot, toolbar_slot_template, ctx, /*$$scope*/ ctx[28], dirty, get_toolbar_slot_changes, get_toolbar_slot_context);
    				}
    			} else {
    				if (toolbar_slot_or_fallback && toolbar_slot_or_fallback.p && dirty[0] & /*actions*/ 1) {
    					toolbar_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			const clues_1_changes = {};
    			if (dirty[0] & /*clues*/ 8) clues_1_changes.clues = /*clues*/ ctx[3];
    			if (dirty[0] & /*cellIndexMap*/ 512) clues_1_changes.cellIndexMap = /*cellIndexMap*/ ctx[9];

    			if (!updating_focusedCellIndex && dirty[0] & /*focusedCellIndex*/ 64) {
    				updating_focusedCellIndex = true;
    				clues_1_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[6];
    				add_flush_callback(() => updating_focusedCellIndex = false);
    			}

    			if (!updating_focusedCell && dirty[0] & /*focusedCell*/ 256) {
    				updating_focusedCell = true;
    				clues_1_changes.focusedCell = /*focusedCell*/ ctx[8];
    				add_flush_callback(() => updating_focusedCell = false);
    			}

    			if (!updating_focusedDirection && dirty[0] & /*focusedDirection*/ 32) {
    				updating_focusedDirection = true;
    				clues_1_changes.focusedDirection = /*focusedDirection*/ ctx[5];
    				add_flush_callback(() => updating_focusedDirection = false);
    			}

    			clues_1.$set(clues_1_changes);
    			const puzzle_changes = {};
    			if (dirty[0] & /*clues*/ 8) puzzle_changes.clues = /*clues*/ ctx[3];
    			if (dirty[0] & /*focusedCell*/ 256) puzzle_changes.focusedCell = /*focusedCell*/ ctx[8];
    			if (dirty[0] & /*isRevealing*/ 128) puzzle_changes.isRevealing = /*isRevealing*/ ctx[7];
    			if (dirty[0] & /*isDisableHighlight*/ 4096) puzzle_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[12];
    			if (dirty[0] & /*revealDuration*/ 2) puzzle_changes.revealDuration = /*revealDuration*/ ctx[1];

    			if (!updating_cells && dirty[0] & /*cells*/ 16) {
    				updating_cells = true;
    				puzzle_changes.cells = /*cells*/ ctx[4];
    				add_flush_callback(() => updating_cells = false);
    			}

    			if (!updating_focusedCellIndex_1 && dirty[0] & /*focusedCellIndex*/ 64) {
    				updating_focusedCellIndex_1 = true;
    				puzzle_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[6];
    				add_flush_callback(() => updating_focusedCellIndex_1 = false);
    			}

    			if (!updating_focusedDirection_1 && dirty[0] & /*focusedDirection*/ 32) {
    				updating_focusedDirection_1 = true;
    				puzzle_changes.focusedDirection = /*focusedDirection*/ ctx[5];
    				add_flush_callback(() => updating_focusedDirection_1 = false);
    			}

    			puzzle.$set(puzzle_changes);

    			if (/*isComplete*/ ctx[10] && !/*isRevealing*/ ctx[7] && /*showCompleteMessage*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isComplete, isRevealing, showCompleteMessage*/ 1156) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(article, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*themeClass*/ 2048 && article_class_value !== (article_class_value = "crossword " + /*themeClass*/ ctx[11] + " svelte-1cndb7v")) {
    				attr(article, "class", article_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toolbar_slot_or_fallback, local);
    			transition_in(clues_1.$$.fragment, local);
    			transition_in(puzzle.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(toolbar_slot_or_fallback, local);
    			transition_out(clues_1.$$.fragment, local);
    			transition_out(puzzle.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(article);
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.d(detaching);
    			destroy_component(clues_1);
    			destroy_component(puzzle);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (104:64)    
    function fallback_block(ctx) {
    	let toolbar;
    	let current;
    	toolbar = new Toolbar({ props: { actions: /*actions*/ ctx[0] } });
    	toolbar.$on("event", /*onToolbarEvent*/ ctx[16]);

    	return {
    		c() {
    			create_component(toolbar.$$.fragment);
    		},
    		l(nodes) {
    			claim_component(toolbar.$$.fragment, nodes);
    		},
    		m(target, anchor) {
    			mount_component(toolbar, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const toolbar_changes = {};
    			if (dirty[0] & /*actions*/ 1) toolbar_changes.actions = /*actions*/ ctx[0];
    			toolbar.$set(toolbar_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(toolbar.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(toolbar, detaching);
    		}
    	};
    }

    // (126:1) {#if isComplete && !isRevealing && showCompleteMessage}
    function create_if_block_1$1(ctx) {
    	let completedmessage;
    	let current;

    	completedmessage = new CompletedMessage({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(completedmessage.$$.fragment);
    		},
    		l(nodes) {
    			claim_component(completedmessage.$$.fragment, nodes);
    		},
    		m(target, anchor) {
    			mount_component(completedmessage, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const completedmessage_changes = {};

    			if (dirty[0] & /*$$scope*/ 268435456) {
    				completedmessage_changes.$$scope = { dirty, ctx };
    			}

    			completedmessage.$set(completedmessage_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(completedmessage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(completedmessage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(completedmessage, detaching);
    		}
    	};
    }

    // (127:3) <CompletedMessage>
    function create_default_slot(ctx) {
    	let current;
    	const complete_slot_template = /*#slots*/ ctx[21].complete;
    	const complete_slot = create_slot(complete_slot_template, ctx, /*$$scope*/ ctx[28], get_complete_slot_context);

    	return {
    		c() {
    			if (complete_slot) complete_slot.c();
    		},
    		l(nodes) {
    			if (complete_slot) complete_slot.l(nodes);
    		},
    		m(target, anchor) {
    			if (complete_slot) {
    				complete_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (complete_slot) {
    				if (complete_slot.p && dirty[0] & /*$$scope*/ 268435456) {
    					update_slot(complete_slot, complete_slot_template, ctx, /*$$scope*/ ctx[28], dirty, get_complete_slot_changes, get_complete_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(complete_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(complete_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (complete_slot) complete_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*validated*/ ctx[13] && create_if_block$3(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*validated*/ ctx[13]) if_block.p(ctx, dirty);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { data = [] } = $$props;
    	let { revealed = false } = $$props;
    	let { actions = ["reset", "reveal"] } = $$props;
    	let { revealDuration = 1000 } = $$props;
    	let { theme = "classic" } = $$props;
    	let { disableHighlight = false } = $$props;
    	let { showCompleteMessage = true } = $$props;
    	let originalClues = createClues(data);
    	let validated = validateClues(originalClues);
    	let clues = originalClues.map(d => ({ ...d }));
    	let cells = createCells(originalClues);
    	let focusedDirection = "across";
    	let focusedCellIndex = 0;
    	let isRevealing = false;
    	let revealTimeout;

    	function checkClues() {
    		return clues.map(d => {
    			const index = d.index;

    			const cellChecks = d.cells.map(c => {
    				const { value } = cells.find(e => e.id === c.id);
    				const hasValue = !!value;
    				const hasCorrect = value === c.answer;
    				return { hasValue, hasCorrect };
    			});

    			const isCorrect = cellChecks.filter(c => c.hasCorrect).length === d.answer.length;
    			const isFilled = cellChecks.filter(c => c.hasValue).length === d.answer.length;
    			return { ...d, isCorrect, isFilled };
    		});
    	}

    	function clear() {
    		$$invalidate(7, isRevealing = false);
    		$$invalidate(6, focusedCellIndex = 0);
    		$$invalidate(5, focusedDirection = "across");
    	}

    	function onReset() {
    		clear();
    		if (revealTimeout) clearTimeout(revealTimeout);
    		$$invalidate(4, cells = cells.map(cell => ({ ...cell, value: "" })));
    		$$invalidate(17, revealed = false);
    	}

    	function onReveal() {
    		if (revealed) return true;
    		clear();
    		$$invalidate(4, cells = cells.map(cell => ({ ...cell, value: cell.answer })));
    		$$invalidate(17, revealed = true);
    		startReveal();
    	}

    	function startReveal() {
    		$$invalidate(7, isRevealing = true);
    		if (revealTimeout) clearTimeout(revealTimeout);

    		revealTimeout = setTimeout(
    			() => {
    				$$invalidate(7, isRevealing = false);
    			},
    			revealDuration + 250
    		);
    	}

    	function onToolbarEvent({ detail }) {
    		if (detail === "reset") onReset(); else if (detail === "reveal") onReveal();
    	}

    	function clues_1_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(6, focusedCellIndex);
    	}

    	function clues_1_focusedCell_binding(value) {
    		focusedCell = value;
    		(($$invalidate(8, focusedCell), $$invalidate(4, cells)), $$invalidate(6, focusedCellIndex));
    	}

    	function clues_1_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(5, focusedDirection);
    	}

    	function puzzle_cells_binding(value) {
    		cells = value;
    		$$invalidate(4, cells);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(6, focusedCellIndex);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(5, focusedDirection);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(18, data = $$props.data);
    		if ("revealed" in $$props) $$invalidate(17, revealed = $$props.revealed);
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    		if ("revealDuration" in $$props) $$invalidate(1, revealDuration = $$props.revealDuration);
    		if ("theme" in $$props) $$invalidate(19, theme = $$props.theme);
    		if ("disableHighlight" in $$props) $$invalidate(20, disableHighlight = $$props.disableHighlight);
    		if ("showCompleteMessage" in $$props) $$invalidate(2, showCompleteMessage = $$props.showCompleteMessage);
    		if ("$$scope" in $$props) $$invalidate(28, $$scope = $$props.$$scope);
    	};

    	let focusedCell;
    	let cellIndexMap;
    	let percentCorrect;
    	let isComplete;
    	let themeClass;
    	let isDisableHighlight;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex*/ 80) {
    			 $$invalidate(8, focusedCell = cells[focusedCellIndex] || {});
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16) {
    			 $$invalidate(9, cellIndexMap = fromPairs(cells.map(cell => [cell.id, cell.index])));
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16) {
    			 $$invalidate(30, percentCorrect = cells.filter(d => d.answer === d.value).length / cells.length);
    		}

    		if ($$self.$$.dirty[0] & /*percentCorrect*/ 1073741824) {
    			 $$invalidate(10, isComplete = percentCorrect == 1);
    		}

    		if ($$self.$$.dirty[0] & /*theme*/ 524288) {
    			 $$invalidate(11, themeClass = theme ? `theme-${theme}` : "");
    		}

    		if ($$self.$$.dirty[0] & /*isComplete, disableHighlight*/ 1049600) {
    			 $$invalidate(12, isDisableHighlight = isComplete && disableHighlight);
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16) {
    			 ($$invalidate(3, clues = checkClues()));
    		}
    	};

    	return [
    		actions,
    		revealDuration,
    		showCompleteMessage,
    		clues,
    		cells,
    		focusedDirection,
    		focusedCellIndex,
    		isRevealing,
    		focusedCell,
    		cellIndexMap,
    		isComplete,
    		themeClass,
    		isDisableHighlight,
    		validated,
    		onReset,
    		onReveal,
    		onToolbarEvent,
    		revealed,
    		data,
    		theme,
    		disableHighlight,
    		slots,
    		clues_1_focusedCellIndex_binding,
    		clues_1_focusedCell_binding,
    		clues_1_focusedDirection_binding,
    		puzzle_cells_binding,
    		puzzle_focusedCellIndex_binding,
    		puzzle_focusedDirection_binding,
    		$$scope
    	];
    }

    class Crossword extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				data: 18,
    				revealed: 17,
    				actions: 0,
    				revealDuration: 1,
    				theme: 19,
    				disableHighlight: 20,
    				showCompleteMessage: 2
    			},
    			[-1, -1]
    		);
    	}
    }

    var dataNYTMini = [
    	{
    		clue: "The 1% of 1% milk",
    		answer: "FAT",
    		direction: "across",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Flicker of light",
    		answer: "GLINT",
    		direction: "across",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "Really neat",
    		answer: "NIFTY",
    		direction: "across",
    		x: 0,
    		y: 2
    	},
    	{
    		clue: "\"__ we meet again\"",
    		answer: "UNTIL",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "It's way over your head",
    		answer: "SKY",
    		direction: "across",
    		x: 0,
    		y: 4
    	},
    	{
    		clue: "Point bonus for using all seven tiles in Scrabble",
    		answer: "FIFTY",
    		direction: "down",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Opposite of pro-",
    		answer: "ANTI",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Texter's \"gotta run\"",
    		answer: "TTYL",
    		direction: "down",
    		x: 4,
    		y: 0
    	},
    	{
    		clue: "Migratory antelopes",
    		answer: "GNUS",
    		direction: "down",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "Clickable part of a webpage",
    		answer: "LINK",
    		direction: "down",
    		x: 1,
    		y: 1
    	}
    ];

    var dataNYTDaily = [
    	{
    		clue: "Bellyache",
    		answer: "BEEF",
    		direction: "across",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "What many people have for public speaking",
    		answer: "PHOBIA",
    		direction: "across",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "\"We ___ loudest when we ___ to ourselves\": Eric Hoffer",
    		answer: "LIE",
    		direction: "across",
    		x: 12,
    		y: 0
    	},
    	{
    		clue: "Taj Mahal city",
    		answer: "AGRA",
    		direction: "across",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "College in Manhattan",
    		answer: "BARUCH",
    		direction: "across",
    		x: 5,
    		y: 1
    	},
    	{
    		clue: "Halloween time: Abbr.",
    		answer: "OCT",
    		direction: "across",
    		x: 12,
    		y: 1
    	},
    	{
    		clue: "Ways to cross a river in Switzerland?",
    		answer: "BERNBRIDGES",
    		direction: "across",
    		x: 0,
    		y: 2
    	},
    	{
    		clue: "Big expense for some city dwellers",
    		answer: "CAR",
    		direction: "across",
    		x: 12,
    		y: 2
    	},
    	{
    		clue: "Old Glory's land, for short",
    		answer: "USOFA",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "Funny Brooks",
    		answer: "MEL",
    		direction: "across",
    		x: 6,
    		y: 3
    	},
    	{
    		clue: "Prop for Mr. Peanut",
    		answer: "CANE",
    		direction: "across",
    		x: 11,
    		y: 3
    	},
    	{
    		clue: "Crow, e.g.",
    		answer: "TRIBE",
    		direction: "across",
    		x: 1,
    		y: 4
    	},
    	{
    		clue: "Fixed a mistake at a card table",
    		answer: "REDEALT",
    		direction: "across",
    		x: 7,
    		y: 4
    	},
    	{
    		clue: "First showing at a film festival in France?",
    		answer: "CANNESOPENER",
    		direction: "across",
    		x: 3,
    		y: 5
    	},
    	{
    		clue: "Co. that merged into Verizon",
    		answer: "GTE",
    		direction: "across",
    		x: 0,
    		y: 6
    	},
    	{
    		clue: "Owned",
    		answer: "HAD",
    		direction: "across",
    		x: 5,
    		y: 6
    	},
    	{
    		clue: "___ Conventions",
    		answer: "GENEVA",
    		direction: "across",
    		x: 9,
    		y: 6
    	},
    	{
    		clue: "Supercharge, as an engine",
    		answer: "REV",
    		direction: "across",
    		x: 0,
    		y: 7
    	},
    	{
    		clue: "Lightly touch, as with a handkerchief",
    		answer: "DAB",
    		direction: "across",
    		x: 4,
    		y: 7
    	},
    	{
    		clue: "Wyoming-to-Missouri dir.",
    		answer: "ESE",
    		direction: "across",
    		x: 8,
    		y: 7
    	},
    	{
    		clue: "Chinese dynasty circa A.D. 250",
    		answer: "WEI",
    		direction: "across",
    		x: 12,
    		y: 7
    	},
    	{
    		clue: "Actress Brie of \"Mad Men\"",
    		answer: "ALISON",
    		direction: "across",
    		x: 0,
    		y: 8
    	},
    	{
    		clue: "Colorful fish",
    		answer: "KOI",
    		direction: "across",
    		x: 7,
    		y: 8
    	},
    	{
    		clue: "Creator of sketches, in brief",
    		answer: "SNL",
    		direction: "across",
    		x: 12,
    		y: 8
    	},
    	{
    		clue: "Census taker in India?",
    		answer: "DELHICOUNTER",
    		direction: "across",
    		x: 0,
    		y: 9
    	},
    	{
    		clue: "Like Barack Obama's presidency",
    		answer: "TWOTERM",
    		direction: "across",
    		x: 1,
    		y: 10
    	},
    	{
    		clue: "Loads",
    		answer: "SLEWS",
    		direction: "across",
    		x: 9,
    		y: 10
    	},
    	{
    		clue: "Denny's competitor",
    		answer: "IHOP",
    		direction: "across",
    		x: 0,
    		y: 11
    	},
    	{
    		clue: "Mensa stats",
    		answer: "IQS",
    		direction: "across",
    		x: 6,
    		y: 11
    	},
    	{
    		clue: "Urban sitting spot",
    		answer: "STOOP",
    		direction: "across",
    		x: 10,
    		y: 11
    	},
    	{
    		clue: "Classic tattoo word",
    		answer: "MOM",
    		direction: "across",
    		x: 0,
    		y: 12
    	},
    	{
    		clue: "Police dragnet in South Korea?",
    		answer: "SEOULSEARCH",
    		direction: "across",
    		x: 4,
    		y: 12
    	},
    	{
    		clue: "Spanish article",
    		answer: "UNA",
    		direction: "across",
    		x: 0,
    		y: 13
    	},
    	{
    		clue: "How café may be served",
    		answer: "AULAIT",
    		direction: "across",
    		x: 4,
    		y: 13
    	},
    	{
    		clue: "\"If you're asking me,\" in textspeak",
    		answer: "IMHO",
    		direction: "across",
    		x: 11,
    		y: 13
    	},
    	{
    		clue: "W-2 fig.",
    		answer: "SSN",
    		direction: "across",
    		x: 0,
    		y: 14
    	},
    	{
    		clue: "Fairly",
    		answer: "PRETTY",
    		direction: "across",
    		x: 4,
    		y: 14
    	},
    	{
    		clue: "\"___ Eyes\" (1975 Eagles hit)",
    		answer: "LYIN",
    		direction: "across",
    		x: 11,
    		y: 14
    	},
    	{
    		clue: "Hindu title of respect",
    		answer: "BABU",
    		direction: "down",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "Expel",
    		answer: "EGEST",
    		direction: "down",
    		x: 1,
    		y: 0
    	},
    	{
    		clue: "Misspeaking, e.g.",
    		answer: "ERROR",
    		direction: "down",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Some derivative stories, colloquially",
    		answer: "FANFIC",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Brew with hipster cred",
    		answer: "PBR",
    		direction: "down",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "American pop-rock band composed of three sisters",
    		answer: "HAIM",
    		direction: "down",
    		x: 6,
    		y: 0
    	},
    	{
    		clue: "Said \"I'll have ...\"",
    		answer: "ORDERED",
    		direction: "down",
    		x: 7,
    		y: 0
    	},
    	{
    		clue: "Cone-shaped corn snacks",
    		answer: "BUGLES",
    		direction: "down",
    		x: 8,
    		y: 0
    	},
    	{
    		clue: "Swelling reducer",
    		answer: "ICE",
    		direction: "down",
    		x: 9,
    		y: 0
    	},
    	{
    		clue: "Sounds of satisfaction",
    		answer: "AHS",
    		direction: "down",
    		x: 10,
    		y: 0
    	},
    	{
    		clue: "Broadcast often seen at 6:00 p.m. and 11:00 p.m.",
    		answer: "LOCALNEWS",
    		direction: "down",
    		x: 12,
    		y: 0
    	},
    	{
    		clue: "\"That is too much for me\"",
    		answer: "ICANTEVEN",
    		direction: "down",
    		x: 13,
    		y: 0
    	},
    	{
    		clue: "To be: Fr.",
    		answer: "ETRE",
    		direction: "down",
    		x: 14,
    		y: 0
    	},
    	{
    		clue: "Cake with rum",
    		answer: "BABA",
    		direction: "down",
    		x: 4,
    		y: 2
    	},
    	{
    		clue: "Battle of Normandy city",
    		answer: "CAEN",
    		direction: "down",
    		x: 11,
    		y: 3
    	},
    	{
    		clue: "Increase, as resolution",
    		answer: "ENHANCE",
    		direction: "down",
    		x: 5,
    		y: 4
    	},
    	{
    		clue: "Watches Bowser, say",
    		answer: "DOGSITS",
    		direction: "down",
    		x: 9,
    		y: 4
    	},
    	{
    		clue: "Dueling sword",
    		answer: "EPEE",
    		direction: "down",
    		x: 10,
    		y: 4
    	},
    	{
    		clue: "Catch",
    		answer: "NAB",
    		direction: "down",
    		x: 6,
    		y: 5
    	},
    	{
    		clue: "Skate park feature",
    		answer: "RAIL",
    		direction: "down",
    		x: 14,
    		y: 5
    	},
    	{
    		clue: "Many a May or June honoree",
    		answer: "GRAD",
    		direction: "down",
    		x: 0,
    		y: 6
    	},
    	{
    		clue: "Some fund-raisers",
    		answer: "TELETHONS",
    		direction: "down",
    		x: 1,
    		y: 6
    	},
    	{
    		clue: "1975 hit by the Electric Light Orchestra",
    		answer: "EVILWOMAN",
    		direction: "down",
    		x: 2,
    		y: 6
    	},
    	{
    		clue: "\"Just ___\" (Nike slogan)",
    		answer: "DOIT",
    		direction: "down",
    		x: 4,
    		y: 7
    	},
    	{
    		clue: "Very long time",
    		answer: "EON",
    		direction: "down",
    		x: 8,
    		y: 7
    	},
    	{
    		clue: "Union workplace",
    		answer: "SHOP",
    		direction: "down",
    		x: 3,
    		y: 8
    	},
    	{
    		clue: "Small citrus fruit",
    		answer: "KUMQUAT",
    		direction: "down",
    		x: 7,
    		y: 8
    	},
    	{
    		clue: "Baltimore athlete",
    		answer: "ORIOLE",
    		direction: "down",
    		x: 6,
    		y: 9
    	},
    	{
    		clue: "If-___ (computer programming statement)",
    		answer: "ELSE",
    		direction: "down",
    		x: 10,
    		y: 9
    	},
    	{
    		clue: "Wholesale's opposite",
    		answer: "RETAIL",
    		direction: "down",
    		x: 11,
    		y: 9
    	},
    	{
    		clue: "Like a bad apple",
    		answer: "WORMY",
    		direction: "down",
    		x: 12,
    		y: 10
    	},
    	{
    		clue: "2014 Winter Olympics locale",
    		answer: "SOCHI",
    		direction: "down",
    		x: 13,
    		y: 10
    	},
    	{
    		clue: "\"___ in the Morning\" (bygone radio show)",
    		answer: "IMUS",
    		direction: "down",
    		x: 0,
    		y: 11
    	},
    	{
    		clue: "Narrow opening",
    		answer: "SLIT",
    		direction: "down",
    		x: 8,
    		y: 11
    	},
    	{
    		clue: "Sound: Prefix",
    		answer: "PHON",
    		direction: "down",
    		x: 14,
    		y: 11
    	},
    	{
    		clue: "Gradually weaken",
    		answer: "SAP",
    		direction: "down",
    		x: 4,
    		y: 12
    	},
    	{
    		clue: "Home of most of the members of NATO: Abbr.",
    		answer: "EUR",
    		direction: "down",
    		x: 5,
    		y: 12
    	},
    	{
    		clue: "Total mess",
    		answer: "STY",
    		direction: "down",
    		x: 9,
    		y: 12
    	}
    ];

    var dataOreo = [
    	{
    		clue: "Black-and-white cookie",
    		answer: "OREO",
    		direction: "down",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "Popular cookie",
    		answer: "OREO",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Creme-filled cookie",
    		answer: "OREO",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "Sandwich cookie",
    		answer: "OREO",
    		direction: "across",
    		x: 0,
    		y: 0
    	}
    ];

    var dataUSA = [
    	{
    		answer: "BARRYMORE",
    		clue: "\"Whip It\" director Drew",
    		direction: "across",
    		x: 0,
    		y: 0,
    		custom: "woman"
    	},
    	{
    		answer: "DAHL",
    		clue: "\"Journey to the Center of the Earth\" star Arlene",
    		direction: "across",
    		x: 9,
    		y: 1,
    		custom: "woman"
    	},
    	{
    		answer: "LETITIA",
    		clue: "\"Black Panther\" actress Wright",
    		direction: "across",
    		x: 0,
    		y: 2,
    		custom: "woman"
    	},
    	{
    		answer: "RIHANNA",
    		clue: "\"Disturbia\" singer",
    		direction: "across",
    		x: 6,
    		y: 3,
    		custom: "woman"
    	},
    	{
    		answer: "DIRK",
    		clue: "Dallas Mavericks great Nowitzki",
    		direction: "across",
    		x: 3,
    		y: 4,
    		custom: "man"
    	},
    	{
    		answer: "HANNAH",
    		clue: "Oscar winner Beachler",
    		direction: "across",
    		x: 6,
    		y: 5,
    		custom: "woman"
    	},
    	{
    		answer: "GEORGIA",
    		clue: "Painter with a museum in Santa Fe",
    		direction: "across",
    		x: 0,
    		y: 6,
    		custom: "woman"
    	},
    	{
    		answer: "LIZZO",
    		clue: "\"Cuz I Love You\" singer",
    		direction: "across",
    		x: 8,
    		y: 7,
    		custom: "woman"
    	},
    	{
    		answer: "LEVY",
    		clue: "TV star Dan",
    		direction: "across",
    		x: 3,
    		y: 8,
    		custom: "man"
    	},
    	{
    		answer: "RAE",
    		clue: "\"The Misadventures of Awkward Black Girl\" author Issa",
    		direction: "across",
    		x: 0,
    		y: 9,
    		custom: "woman"
    	},
    	{
    		answer: "ALBERT",
    		clue: "Slugger Pujols",
    		direction: "across",
    		x: 6,
    		y: 9,
    		custom: "man"
    	},
    	{
    		answer: "TRACE",
    		clue: "\"Hustlers\" actress Lysette",
    		direction: "across",
    		x: 0,
    		y: 11,
    		custom: "woman"
    	},
    	{
    		answer: "OHENRY",
    		clue: "\"The Gift of the Magi\" author",
    		direction: "across",
    		x: 5,
    		y: 12,
    		custom: "man"
    	},
    	{
    		answer: "BELLA",
    		clue: "Actress Thorne",
    		direction: "down",
    		x: 0,
    		y: 0,
    		custom: "woman"
    	},
    	{
    		answer: "RITA",
    		clue: "Acting legend Moreno",
    		direction: "down",
    		x: 2,
    		y: 0,
    		custom: "woman"
    	},
    	{
    		answer: "OMARKHAYYAM",
    		clue: "Persian poet, astronomer, mathematician",
    		direction: "down",
    		x: 6,
    		y: 0,
    		custom: "man"
    	},
    	{
    		answer: "ALIA",
    		clue: "\"Search Party\" star Shawkat",
    		direction: "down",
    		x: 12,
    		y: 0,
    		custom: "woman"
    	},
    	{
    		answer: "DUA",
    		clue: "\"New Rules\" singer Lipa",
    		direction: "down",
    		x: 9,
    		y: 1,
    		custom: "woman"
    	},
    	{
    		answer: "NIA",
    		clue: "\"In Too Deep\" actress Long",
    		direction: "down",
    		x: 10,
    		y: 3,
    		custom: "woman"
    	},
    	{
    		answer: "DARYL",
    		clue: "Actress ___ Hannah",
    		direction: "down",
    		x: 3,
    		y: 4,
    		custom: "woman"
    	},
    	{
    		answer: "LEBRON",
    		clue: "NBA star James",
    		direction: "down",
    		x: 8,
    		y: 7,
    		custom: "man"
    	},
    	{
    		answer: "GRETA",
    		clue: "Director Gerwig",
    		direction: "down",
    		x: 0,
    		y: 8,
    		custom: "woman"
    	},
    	{
    		answer: "ELLE",
    		clue: "\"Ex's & Oh's\" singer King",
    		direction: "down",
    		x: 4,
    		y: 8,
    		custom: "woman"
    	},
    	{
    		answer: "EVA",
    		clue: "Model Marcille",
    		direction: "down",
    		x: 2,
    		y: 9,
    		custom: "woman"
    	},
    	{
    		answer: "TAN",
    		clue: "Fashion expert France",
    		direction: "down",
    		x: 11,
    		y: 9,
    		custom: "man"
    	}
    ];

    /* src/example/App.svelte generated by Svelte v3.29.0 */

    function create_toolbar_slot(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let t1;
    	let button1;
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("reset");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("reveal");
    			this.h();
    		},
    		l(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, slot: true, style: true });
    			var div_nodes = children(div);
    			button0 = claim_element(div_nodes, "BUTTON", {});
    			var button0_nodes = children(button0);
    			t0 = claim_text(button0_nodes, "reset");
    			button0_nodes.forEach(detach);
    			t1 = claim_space(div_nodes);
    			button1 = claim_element(div_nodes, "BUTTON", {});
    			var button1_nodes = children(button1);
    			t2 = claim_text(button1_nodes, "reveal");
    			button1_nodes.forEach(detach);
    			div_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(div, "class", "toolbar");
    			attr(div, "slot", "toolbar");
    			set_style(div, "background", "yellow");
    			set_style(div, "padding", "2em");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(button0, t0);
    			append(div, t1);
    			append(div, button1);
    			append(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", function () {
    						if (is_function(/*onReset*/ ctx[4])) /*onReset*/ ctx[4].apply(this, arguments);
    					}),
    					listen(button1, "click", function () {
    						if (is_function(/*onReveal*/ ctx[5])) /*onReveal*/ ctx[5].apply(this, arguments);
    					})
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (67:6) <img         slot="complete"         alt="celebration"         src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif" />
    function create_complete_slot(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			this.h();
    		},
    		l(nodes) {
    			img = claim_element(nodes, "IMG", { slot: true, alt: true, src: true });
    			this.h();
    		},
    		h() {
    			attr(img, "slot", "complete");
    			attr(img, "alt", "celebration");
    			if (img.src !== (img_src_value = "https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif")) attr(img, "src", img_src_value);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (57:4) <Crossword data="{dataNYTDaily}">
    function create_default_slot$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = space();
    		},
    		l(nodes) {
    			t = claim_space(nodes);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let article;
    	let div0;
    	let h10;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let t3;
    	let t4;
    	let a1;
    	let t5;
    	let t6;
    	let t7;
    	let section0;
    	let p1;
    	let t8;
    	let t9;
    	let h11;
    	let t10;
    	let t11;
    	let p2;
    	let t12;
    	let a2;
    	let t13;
    	let t14;
    	let t15;
    	let crossword0;
    	let t16;
    	let section1;
    	let p3;
    	let t17;
    	let t18;
    	let h12;
    	let t19;
    	let t20;
    	let p4;
    	let t21;
    	let a3;
    	let t22;
    	let t23;
    	let t24;
    	let crossword1;
    	let t25;
    	let section2;
    	let p5;
    	let t26;
    	let t27;
    	let h13;
    	let t28;
    	let t29;
    	let p6;
    	let t30;
    	let t31;
    	let select;
    	let option0;
    	let t32;
    	let option1;
    	let t33;
    	let option2;
    	let t34;
    	let option3;
    	let t35;
    	let t36;
    	let div1;
    	let crossword2;
    	let t37;
    	let section3;
    	let p7;
    	let t38;
    	let t39;
    	let h14;
    	let t40;
    	let t41;
    	let p8;
    	let t42;
    	let t43;
    	let crossword3;
    	let updating_revealed;
    	let t44;
    	let section4;
    	let p9;
    	let t45;
    	let t46;
    	let p10;
    	let t47;
    	let t48;
    	let crossword4;
    	let current;
    	let mounted;
    	let dispose;
    	crossword0 = new Crossword({ props: { data: dataNYTMini } });
    	crossword1 = new Crossword({ props: { data: dataNYTDaily } });

    	crossword2 = new Crossword({
    			props: {
    				data: dataOreo,
    				theme: /*theme*/ ctx[1],
    				showCompleteMessage: false
    			}
    		});

    	function crossword3_revealed_binding(value) {
    		/*crossword3_revealed_binding*/ ctx[3].call(null, value);
    	}

    	let crossword3_props = { data: dataUSA };

    	if (/*revealedUSA*/ ctx[0] !== void 0) {
    		crossword3_props.revealed = /*revealedUSA*/ ctx[0];
    	}

    	crossword3 = new Crossword({ props: crossword3_props });
    	binding_callbacks.push(() => bind(crossword3, "revealed", crossword3_revealed_binding));

    	crossword4 = new Crossword({
    			props: {
    				data: dataNYTDaily,
    				$$slots: {
    					default: [create_default_slot$1],
    					complete: [create_complete_slot],
    					toolbar: [
    						create_toolbar_slot,
    						({ onReset, onReveal }) => ({ 4: onReset, 5: onReveal }),
    						({ onReset, onReveal }) => (onReset ? 16 : 0) | (onReveal ? 32 : 0)
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			article = element("article");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text("Svelte Crossword");
    			t1 = space();
    			p0 = element("p");
    			t2 = text("A crossword component for ");
    			a0 = element("a");
    			t3 = text("Svelte");
    			t4 = text(". Read the docs on ");
    			a1 = element("a");
    			t5 = text("Github");
    			t6 = text(".");
    			t7 = space();
    			section0 = element("section");
    			p1 = element("p");
    			t8 = text("Example");
    			t9 = space();
    			h11 = element("h1");
    			t10 = text("Default");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("An ");
    			a2 = element("a");
    			t13 = text("NYT mini");
    			t14 = text(" puzzle with all default settings.");
    			t15 = space();
    			create_component(crossword0.$$.fragment);
    			t16 = space();
    			section1 = element("section");
    			p3 = element("p");
    			t17 = text("Example");
    			t18 = space();
    			h12 = element("h1");
    			t19 = text("Default");
    			t20 = space();
    			p4 = element("p");
    			t21 = text("An ");
    			a3 = element("a");
    			t22 = text("NYT daily");
    			t23 = text(" puzzle with all default settings.");
    			t24 = space();
    			create_component(crossword1.$$.fragment);
    			t25 = space();
    			section2 = element("section");
    			p5 = element("p");
    			t26 = text("Example");
    			t27 = space();
    			h13 = element("h1");
    			t28 = text("Themes");
    			t29 = space();
    			p6 = element("p");
    			t30 = text("A library of preset style themes to choose from.");
    			t31 = space();
    			select = element("select");
    			option0 = element("option");
    			t32 = text("Classic");
    			option1 = element("option");
    			t33 = text("Dark");
    			option2 = element("option");
    			t34 = text("Amelia");
    			option3 = element("option");
    			t35 = text("Citrus");
    			t36 = space();
    			div1 = element("div");
    			create_component(crossword2.$$.fragment);
    			t37 = space();
    			section3 = element("section");
    			p7 = element("p");
    			t38 = text("Example");
    			t39 = space();
    			h14 = element("h1");
    			t40 = text("Simple Customization");
    			t41 = space();
    			p8 = element("p");
    			t42 = text("Custom class name on cells.");
    			t43 = space();
    			create_component(crossword3.$$.fragment);
    			t44 = space();
    			section4 = element("section");
    			p9 = element("p");
    			t45 = text("Example");
    			t46 = space();
    			p10 = element("p");
    			t47 = text("Advanced Customization");
    			t48 = space();
    			create_component(crossword4.$$.fragment);
    			this.h();
    		},
    		l(nodes) {
    			article = claim_element(nodes, "ARTICLE", { class: true });
    			var article_nodes = children(article);
    			div0 = claim_element(article_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h10 = claim_element(div0_nodes, "H1", { class: true });
    			var h10_nodes = children(h10);
    			t0 = claim_text(h10_nodes, "Svelte Crossword");
    			h10_nodes.forEach(detach);
    			t1 = claim_space(div0_nodes);
    			p0 = claim_element(div0_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t2 = claim_text(p0_nodes, "A crossword component for ");
    			a0 = claim_element(p0_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t3 = claim_text(a0_nodes, "Svelte");
    			a0_nodes.forEach(detach);
    			t4 = claim_text(p0_nodes, ". Read the docs on ");
    			a1 = claim_element(p0_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t5 = claim_text(a1_nodes, "Github");
    			a1_nodes.forEach(detach);
    			t6 = claim_text(p0_nodes, ".");
    			p0_nodes.forEach(detach);
    			div0_nodes.forEach(detach);
    			t7 = claim_space(article_nodes);
    			section0 = claim_element(article_nodes, "SECTION", { class: true });
    			var section0_nodes = children(section0);
    			p1 = claim_element(section0_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t8 = claim_text(p1_nodes, "Example");
    			p1_nodes.forEach(detach);
    			t9 = claim_space(section0_nodes);
    			h11 = claim_element(section0_nodes, "H1", { class: true });
    			var h11_nodes = children(h11);
    			t10 = claim_text(h11_nodes, "Default");
    			h11_nodes.forEach(detach);
    			t11 = claim_space(section0_nodes);
    			p2 = claim_element(section0_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t12 = claim_text(p2_nodes, "An ");
    			a2 = claim_element(p2_nodes, "A", { href: true });
    			var a2_nodes = children(a2);
    			t13 = claim_text(a2_nodes, "NYT mini");
    			a2_nodes.forEach(detach);
    			t14 = claim_text(p2_nodes, " puzzle with all default settings.");
    			p2_nodes.forEach(detach);
    			t15 = claim_space(section0_nodes);
    			claim_component(crossword0.$$.fragment, section0_nodes);
    			section0_nodes.forEach(detach);
    			t16 = claim_space(article_nodes);
    			section1 = claim_element(article_nodes, "SECTION", { class: true });
    			var section1_nodes = children(section1);
    			p3 = claim_element(section1_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t17 = claim_text(p3_nodes, "Example");
    			p3_nodes.forEach(detach);
    			t18 = claim_space(section1_nodes);
    			h12 = claim_element(section1_nodes, "H1", { class: true });
    			var h12_nodes = children(h12);
    			t19 = claim_text(h12_nodes, "Default");
    			h12_nodes.forEach(detach);
    			t20 = claim_space(section1_nodes);
    			p4 = claim_element(section1_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			t21 = claim_text(p4_nodes, "An ");
    			a3 = claim_element(p4_nodes, "A", { href: true });
    			var a3_nodes = children(a3);
    			t22 = claim_text(a3_nodes, "NYT daily");
    			a3_nodes.forEach(detach);
    			t23 = claim_text(p4_nodes, " puzzle with all default settings.");
    			p4_nodes.forEach(detach);
    			t24 = claim_space(section1_nodes);
    			claim_component(crossword1.$$.fragment, section1_nodes);
    			section1_nodes.forEach(detach);
    			t25 = claim_space(article_nodes);
    			section2 = claim_element(article_nodes, "SECTION", { class: true });
    			var section2_nodes = children(section2);
    			p5 = claim_element(section2_nodes, "P", { class: true });
    			var p5_nodes = children(p5);
    			t26 = claim_text(p5_nodes, "Example");
    			p5_nodes.forEach(detach);
    			t27 = claim_space(section2_nodes);
    			h13 = claim_element(section2_nodes, "H1", { class: true });
    			var h13_nodes = children(h13);
    			t28 = claim_text(h13_nodes, "Themes");
    			h13_nodes.forEach(detach);
    			t29 = claim_space(section2_nodes);
    			p6 = claim_element(section2_nodes, "P", { class: true });
    			var p6_nodes = children(p6);
    			t30 = claim_text(p6_nodes, "A library of preset style themes to choose from.");
    			p6_nodes.forEach(detach);
    			t31 = claim_space(section2_nodes);
    			select = claim_element(section2_nodes, "SELECT", {});
    			var select_nodes = children(select);
    			option0 = claim_element(select_nodes, "OPTION", { value: true });
    			var option0_nodes = children(option0);
    			t32 = claim_text(option0_nodes, "Classic");
    			option0_nodes.forEach(detach);
    			option1 = claim_element(select_nodes, "OPTION", { value: true });
    			var option1_nodes = children(option1);
    			t33 = claim_text(option1_nodes, "Dark");
    			option1_nodes.forEach(detach);
    			option2 = claim_element(select_nodes, "OPTION", { value: true });
    			var option2_nodes = children(option2);
    			t34 = claim_text(option2_nodes, "Amelia");
    			option2_nodes.forEach(detach);
    			option3 = claim_element(select_nodes, "OPTION", { value: true });
    			var option3_nodes = children(option3);
    			t35 = claim_text(option3_nodes, "Citrus");
    			option3_nodes.forEach(detach);
    			select_nodes.forEach(detach);
    			t36 = claim_space(section2_nodes);
    			div1 = claim_element(section2_nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			claim_component(crossword2.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach);
    			section2_nodes.forEach(detach);
    			t37 = claim_space(article_nodes);
    			section3 = claim_element(article_nodes, "SECTION", { class: true });
    			var section3_nodes = children(section3);
    			p7 = claim_element(section3_nodes, "P", { class: true });
    			var p7_nodes = children(p7);
    			t38 = claim_text(p7_nodes, "Example");
    			p7_nodes.forEach(detach);
    			t39 = claim_space(section3_nodes);
    			h14 = claim_element(section3_nodes, "H1", { class: true });
    			var h14_nodes = children(h14);
    			t40 = claim_text(h14_nodes, "Simple Customization");
    			h14_nodes.forEach(detach);
    			t41 = claim_space(section3_nodes);
    			p8 = claim_element(section3_nodes, "P", { class: true });
    			var p8_nodes = children(p8);
    			t42 = claim_text(p8_nodes, "Custom class name on cells.");
    			p8_nodes.forEach(detach);
    			t43 = claim_space(section3_nodes);
    			claim_component(crossword3.$$.fragment, section3_nodes);
    			section3_nodes.forEach(detach);
    			t44 = claim_space(article_nodes);
    			section4 = claim_element(article_nodes, "SECTION", { class: true });
    			var section4_nodes = children(section4);
    			p9 = claim_element(section4_nodes, "P", { class: true });
    			var p9_nodes = children(p9);
    			t45 = claim_text(p9_nodes, "Example");
    			p9_nodes.forEach(detach);
    			t46 = claim_space(section4_nodes);
    			p10 = claim_element(section4_nodes, "P", { class: true });
    			var p10_nodes = children(p10);
    			t47 = claim_text(p10_nodes, "Advanced Customization");
    			p10_nodes.forEach(detach);
    			t48 = claim_space(section4_nodes);
    			claim_component(crossword4.$$.fragment, section4_nodes);
    			section4_nodes.forEach(detach);
    			article_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(h10, "class", "svelte-1o1l0pp");
    			attr(a0, "href", "https://svelte.dev");
    			attr(a1, "href", "https://github.com/russellgoldenberg/svelte-crossword#svelte-crossword");
    			attr(p0, "class", "svelte-1o1l0pp");
    			attr(div0, "class", "intro svelte-1o1l0pp");
    			attr(p1, "class", "example svelte-1o1l0pp");
    			attr(h11, "class", "svelte-1o1l0pp");
    			attr(a2, "href", "https://www.nytimes.com/crosswords/game/mini/2020/10/21");
    			attr(p2, "class", "svelte-1o1l0pp");
    			attr(section0, "class", "nyt-mini svelte-1o1l0pp");
    			attr(p3, "class", "example svelte-1o1l0pp");
    			attr(h12, "class", "svelte-1o1l0pp");
    			attr(a3, "href", "https://www.nytimes.com/crosswords/game/daily/2020/10/21");
    			attr(p4, "class", "svelte-1o1l0pp");
    			attr(section1, "class", "nyt-daily svelte-1o1l0pp");
    			attr(p5, "class", "example svelte-1o1l0pp");
    			attr(h13, "class", "svelte-1o1l0pp");
    			attr(p6, "class", "svelte-1o1l0pp");
    			option0.__value = "classic";
    			option0.value = option0.__value;
    			option1.__value = "dark";
    			option1.value = option1.__value;
    			option2.__value = "amelia";
    			option2.value = option2.__value;
    			option3.__value = "citrus";
    			option3.value = option3.__value;
    			if (/*theme*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			attr(section2, "class", "amelia svelte-1o1l0pp");
    			attr(p7, "class", "example svelte-1o1l0pp");
    			attr(h14, "class", "svelte-1o1l0pp");
    			attr(p8, "class", "svelte-1o1l0pp");
    			attr(section3, "class", "usa svelte-1o1l0pp");
    			toggle_class(section3, "is-revealed", /*revealedUSA*/ ctx[0]);
    			attr(p9, "class", "example svelte-1o1l0pp");
    			attr(p10, "class", "svelte-1o1l0pp");
    			attr(section4, "class", "svelte-1o1l0pp");
    			attr(article, "class", "svelte-1o1l0pp");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, div0);
    			append(div0, h10);
    			append(h10, t0);
    			append(div0, t1);
    			append(div0, p0);
    			append(p0, t2);
    			append(p0, a0);
    			append(a0, t3);
    			append(p0, t4);
    			append(p0, a1);
    			append(a1, t5);
    			append(p0, t6);
    			append(article, t7);
    			append(article, section0);
    			append(section0, p1);
    			append(p1, t8);
    			append(section0, t9);
    			append(section0, h11);
    			append(h11, t10);
    			append(section0, t11);
    			append(section0, p2);
    			append(p2, t12);
    			append(p2, a2);
    			append(a2, t13);
    			append(p2, t14);
    			append(section0, t15);
    			mount_component(crossword0, section0, null);
    			append(article, t16);
    			append(article, section1);
    			append(section1, p3);
    			append(p3, t17);
    			append(section1, t18);
    			append(section1, h12);
    			append(h12, t19);
    			append(section1, t20);
    			append(section1, p4);
    			append(p4, t21);
    			append(p4, a3);
    			append(a3, t22);
    			append(p4, t23);
    			append(section1, t24);
    			mount_component(crossword1, section1, null);
    			append(article, t25);
    			append(article, section2);
    			append(section2, p5);
    			append(p5, t26);
    			append(section2, t27);
    			append(section2, h13);
    			append(h13, t28);
    			append(section2, t29);
    			append(section2, p6);
    			append(p6, t30);
    			append(section2, t31);
    			append(section2, select);
    			append(select, option0);
    			append(option0, t32);
    			append(select, option1);
    			append(option1, t33);
    			append(select, option2);
    			append(option2, t34);
    			append(select, option3);
    			append(option3, t35);
    			select_option(select, /*theme*/ ctx[1]);
    			append(section2, t36);
    			append(section2, div1);
    			mount_component(crossword2, div1, null);
    			append(article, t37);
    			append(article, section3);
    			append(section3, p7);
    			append(p7, t38);
    			append(section3, t39);
    			append(section3, h14);
    			append(h14, t40);
    			append(section3, t41);
    			append(section3, p8);
    			append(p8, t42);
    			append(section3, t43);
    			mount_component(crossword3, section3, null);
    			append(article, t44);
    			append(article, section4);
    			append(section4, p9);
    			append(p9, t45);
    			append(section4, t46);
    			append(section4, p10);
    			append(p10, t47);
    			append(section4, t48);
    			mount_component(crossword4, section4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*theme*/ 2) {
    				select_option(select, /*theme*/ ctx[1]);
    			}

    			const crossword2_changes = {};
    			if (dirty & /*theme*/ 2) crossword2_changes.theme = /*theme*/ ctx[1];
    			crossword2.$set(crossword2_changes);
    			const crossword3_changes = {};

    			if (!updating_revealed && dirty & /*revealedUSA*/ 1) {
    				updating_revealed = true;
    				crossword3_changes.revealed = /*revealedUSA*/ ctx[0];
    				add_flush_callback(() => updating_revealed = false);
    			}

    			crossword3.$set(crossword3_changes);

    			if (dirty & /*revealedUSA*/ 1) {
    				toggle_class(section3, "is-revealed", /*revealedUSA*/ ctx[0]);
    			}

    			const crossword4_changes = {};

    			if (dirty & /*$$scope, onReveal, onReset*/ 112) {
    				crossword4_changes.$$scope = { dirty, ctx };
    			}

    			crossword4.$set(crossword4_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(crossword0.$$.fragment, local);
    			transition_in(crossword1.$$.fragment, local);
    			transition_in(crossword2.$$.fragment, local);
    			transition_in(crossword3.$$.fragment, local);
    			transition_in(crossword4.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(crossword0.$$.fragment, local);
    			transition_out(crossword1.$$.fragment, local);
    			transition_out(crossword2.$$.fragment, local);
    			transition_out(crossword3.$$.fragment, local);
    			transition_out(crossword4.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(article);
    			destroy_component(crossword0);
    			destroy_component(crossword1);
    			destroy_component(crossword2);
    			destroy_component(crossword3);
    			destroy_component(crossword4);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let revealedUSA;
    	let theme;

    	function select_change_handler() {
    		theme = select_value(this);
    		$$invalidate(1, theme);
    	}

    	function crossword3_revealed_binding(value) {
    		revealedUSA = value;
    		$$invalidate(0, revealedUSA);
    	}

    	return [revealedUSA, theme, select_change_handler, crossword3_revealed_binding];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
    	}
    }

    const dev = !!undefined;

    const app = new App({
      target: document.querySelector("main"),
      hydrate: !dev
    });

    if (dev) {
      undefined.dispose(() => {
        app.$destroy();
      });
      undefined.accept();
    }

    return app;

}());
//# sourceMappingURL=bundle.js.map
