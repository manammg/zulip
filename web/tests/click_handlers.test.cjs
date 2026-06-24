"use strict";

const assert = require("node:assert/strict");

const $ = require("./lib/zjquery.cjs");
const {mock_esm, set_global, zrequire} = require("./lib/namespace.cjs");
const {run_test} = require("./lib/test.cjs");

const message = {id: 123};

mock_esm("../src/message_lists", {
    current: {
        get(message_id) {
            assert.equal(message_id, 123);
            return message;
        },
    },
});

mock_esm("../src/rows", {
    id() {
        return 123;
    },
});

let toggle_called = false;

mock_esm("../src/message_actions_popover", {
    toggle_message_actions_menu(received_message) {
        assert.equal(received_message, message);
        toggle_called = true;
    },
});

mock_esm("../src/util", {
    is_mobile() {
        return false;
    },
});

const click_handlers = zrequire("click_handlers");

run_test("right-click on normal message opens message actions menu", () => {
    set_global("window", {
        getSelection() {
            return {
                toString() {
                    return "";
                },
            };
        },
    });

    click_handlers.initialize();

    const contextmenu_handler = $("#main_div").get_on_handler("contextmenu", ".messagebox");

    const event = {
        target: $("#message-content").get(0),
        currentTarget: $(".messagebox").get(0),
        prevent_default_called: false,
        preventDefault() {
            this.prevent_default_called = true;
        },
    };

    contextmenu_handler(event);

    assert.equal(event.prevent_default_called, true);
    assert.equal(toggle_called, true);
});
