/*!
* rete-react-plugin v2.0.2
* (c) 2023 Vitaliy Stoliarov
* Released under the MIT license.
* */
import _typeof from '@babel/runtime/helpers/typeof';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _inherits from '@babel/runtime/helpers/inherits';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import * as React from 'react';
import { useState, useRef, useEffect, useContext, createContext, useCallback, useLayoutEffect } from 'react';
import { ClassicPreset, Scope } from 'rete';
import * as ReactDOM from 'react-dom';
import { flushSync } from 'react-dom';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { getDOMSocketPosition, loopConnectionPath, classicConnectionPath } from 'rete-render-utils';
import _taggedTemplateLiteral from '@babel/runtime/helpers/taggedTemplateLiteral';
import styled, { css } from 'styled-components';
import _extends from '@babel/runtime/helpers/extends';
import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
import { BaseAreaPlugin } from 'rete-area-plugin';

function getRenderer(props) {
  var createRoot = props === null || props === void 0 ? void 0 : props.createRoot;
  if (createRoot) {
    var roots = new WeakMap();
    return {
      mount: function (element, container) {
        if (!roots.has(container)) {
          roots.set(container, createRoot(container));
        }
        var root = roots.get(container);
        return root.render(element);
      },
      unmount: function unmount(container) {
        var root = roots.get(container);
        if (root) {
          root.unmount();
          roots["delete"](container);
        }
      }
    };
  }
  return {
    mount: ReactDOM.render,
    unmount: ReactDOM.unmountComponentAtNode
  };
}

function Root(_ref) {
  var children = _ref.children,
    rendered = _ref.rendered;
  useEffect(function () {
    rendered();
  });
  return children;
}
function syncFlush() {
  var ready = useRef(false);
  useEffect(function () {
    ready.current = true;
  }, []);
  return {
    apply: function apply(f) {
      if (ready.current) {
        try {
          flushSync(f);
        } catch (error) {
          var message = error ? error.message : null;
          if (message && (message.includes('flushSync was called from inside a lifecycle method') || message.includes('React error #187'))) {
            f();
            return;
          }
          throw error;
        }
      } else {
        f();
      }
    }
  };
}
function useRete(create) {
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    container = _useState2[0],
    setContainer = _useState2[1];
  var editorRef = useRef();
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    editor = _useState4[0],
    setEditor = _useState4[1];
  var ref = useRef(null);
  useEffect(function () {
    if (container) {
      if (editorRef.current) {
        editorRef.current.destroy();
        container.innerHTML = '';
      }
      create(container).then(function (value) {
        editorRef.current = value;
        setEditor(value);
      });
    }
  }, [container, create]);
  useEffect(function () {
    return function () {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);
  useEffect(function () {
    if (ref.current) {
      setContainer(ref.current);
    }
  }, [ref.current]);
  return [ref, editor];
}

var ConnectionContext = /*#__PURE__*/createContext({
  start: null,
  end: null,
  path: null
});
function ConnectionWrapper(props) {
  var children = props.children;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    computedStart = _useState2[0],
    setStart = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    computedEnd = _useState4[0],
    setEnd = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    path = _useState6[0],
    setPath = _useState6[1];
  var start = 'x' in props.start ? props.start : computedStart;
  var end = 'x' in props.end ? props.end : computedEnd;
  var flush = syncFlush();
  useEffect(function () {
    var unwatch1 = typeof props.start === 'function' && props.start(function (s) {
      return flush.apply(function () {
        return setStart(s);
      });
    });
    var unwatch2 = typeof props.end === 'function' && props.end(function (s) {
      return flush.apply(function () {
        return setEnd(s);
      });
    });
    return function () {
      unwatch1 && unwatch1();
      unwatch2 && unwatch2();
    };
  }, []);
  useEffect(function () {
    if (start && end) props.path(start, end).then(function (p) {
      return flush.apply(function () {
        return setPath(p);
      });
    });
  }, [start, end]);
  return /*#__PURE__*/React.createElement(ConnectionContext.Provider, {
    value: {
      start: start,
      end: end,
      path: path
    }
  }, children);
}
function useConnection() {
  return useContext(ConnectionContext);
}

var _templateObject$b, _templateObject2$3;
var Svg = styled.svg(_templateObject$b || (_templateObject$b = _taggedTemplateLiteral(["\n    overflow: visible !important;\n    position: absolute;\n    pointer-events: none;\n    width: 9999px;\n    height: 9999px;\n"])));
var Path = styled.path(_templateObject2$3 || (_templateObject2$3 = _taggedTemplateLiteral(["\n    fill: none;\n    stroke-width: 5px;\n    stroke: steelblue;\n    pointer-events: auto;\n    ", "\n"])), function (props) {
  return props.styles && props.styles(props);
});
function Connection(props) {
  var _useConnection = useConnection(),
    path = _useConnection.path;
  if (!path) return null;
  return /*#__PURE__*/React.createElement(Svg, {
    "data-testid": "connection"
  }, /*#__PURE__*/React.createElement(Path, {
    styles: props.styles,
    d: path
  }));
}

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }
function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function copyEvent(e) {
  var newEvent = new e.constructor(e.type);
  var current = newEvent;
  while (current = Object.getPrototypeOf(current)) {
    var keys = Object.getOwnPropertyNames(current);
    var _iterator = _createForOfIteratorHelper$1(keys),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var k = _step.value;
        var item = newEvent[k];
        if (typeof item === 'function') continue;
        Object.defineProperty(newEvent, k, {
          value: e[k]
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  return newEvent;
}
var rootPrefix = '__reactContainer$';
function findReactRoot(element) {
  var current = element;
  while (current) {
    if (current._reactRootContainer || Object.keys(current).some(function (key) {
      return key.startsWith(rootPrefix);
    })) return current;
    current = current.parentElement;
  }
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function useDrag(translate, getPointer) {
  return {
    start: function start(e) {
      var previous = _objectSpread$1({}, getPointer(e));
      function move(moveEvent) {
        var current = _objectSpread$1({}, getPointer(moveEvent));
        var dx = current.x - previous.x;
        var dy = current.y - previous.y;
        previous = current;
        translate(dx, dy);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    }
  };
}
function useNoDrag(ref, disabled) {
  React.useEffect(function () {
    var handleClick = function handleClick(e) {
      if (disabled) return;
      var root = findReactRoot(e.target);
      var target = React.version.startsWith('16') ? document : root;
      if (target) {
        e.stopPropagation();
        target.dispatchEvent(copyEvent(e));
      }
    };
    var el = ref.current;
    el === null || el === void 0 ? void 0 : el.addEventListener('pointerdown', handleClick);
    return function () {
      el === null || el === void 0 ? void 0 : el.removeEventListener('pointerdown', handleClick);
    };
  }, [ref, disabled]);
}
function NoDrag(props) {
  var ref = React.useRef(null);
  useNoDrag(ref, props.disabled);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref
  }, props.children);
}

var drag = /*#__PURE__*/Object.freeze({
  __proto__: null,
  useDrag: useDrag,
  useNoDrag: useNoDrag,
  NoDrag: NoDrag
});

var _templateObject$a;
var Input = styled.input(_templateObject$a || (_templateObject$a = _taggedTemplateLiteral(["\n  width: 100%;\n  border-radius: 30px;\n  background-color: white;\n  padding: 2px 6px;\n  border: 1px solid #999;\n  font-size: 110%;\n  box-sizing: border-box;\n  ", "\n"])), function (props) {
  return props.styles && props.styles(props);
});
function Control(props) {
  var _React$useState = React.useState(props.data.value),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    value = _React$useState2[0],
    setValue = _React$useState2[1];
  var ref = React.useRef(null);
  useNoDrag(ref);
  React.useEffect(function () {
    setValue(props.data.value);
  }, [props.data.value]);
  return /*#__PURE__*/React.createElement(Input, {
    value: value,
    type: props.data.type,
    ref: ref,
    readOnly: props.data.readonly,
    onChange: function onChange(e) {
      var val = props.data.type === 'number' ? +e.target.value : e.target.value;
      setValue(val);
      props.data.setValue(val);
    },
    styles: props.styles
  });
}

var $nodecolor = 'rgba(110,136,255,0.8)';
var $nodecolorselected = '#ffd92c';
var $socketsize = 24;
var $socketmargin = 6;
var $socketcolor = '#96b38a';
var $nodewidth = 180;

var vars = /*#__PURE__*/Object.freeze({
  __proto__: null,
  $nodecolor: $nodecolor,
  $nodecolorselected: $nodecolorselected,
  $socketsize: $socketsize,
  $socketmargin: $socketmargin,
  $socketcolor: $socketcolor,
  $nodewidth: $nodewidth
});

var _excluded$2 = ["init", "unmount"];
/**
 * Component for rendering various elements embedded in the React.js component tree.
 */
function RefComponent(_ref) {
  var init = _ref.init,
    unmount = _ref.unmount,
    props = _objectWithoutProperties(_ref, _excluded$2);
  var ref = React.useRef(null);
  React.useEffect(function () {
    var element = ref.current;
    return function () {
      if (element) unmount(element);
    };
  }, []);
  React.useEffect(function () {
    if (ref.current) init(ref.current);
  });
  return /*#__PURE__*/React.createElement("span", _extends({}, props, {
    ref: ref
  }));
}

var _excluded$1 = ["name", "emit", "payload"];
function RefControl(_ref) {
  var name = _ref.name,
    emit = _ref.emit,
    payload = _ref.payload,
    props = _objectWithoutProperties(_ref, _excluded$1);
  return /*#__PURE__*/React.createElement(RefComponent, _extends({}, props, {
    className: name,
    init: function init(ref) {
      return emit({
        type: 'render',
        data: {
          type: 'control',
          element: ref,
          payload: payload
        }
      });
    },
    unmount: function unmount(ref) {
      return emit({
        type: 'unmount',
        data: {
          element: ref
        }
      });
    }
  }));
}

var _excluded = ["name", "emit", "nodeId", "side", "socketKey", "payload"];
function RefSocket(_ref) {
  var name = _ref.name,
    emit = _ref.emit,
    nodeId = _ref.nodeId,
    side = _ref.side,
    socketKey = _ref.socketKey,
    payload = _ref.payload,
    props = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/React.createElement(RefComponent, _extends({}, props, {
    className: name,
    init: function init(ref) {
      return emit({
        type: 'render',
        data: {
          type: 'socket',
          side: side,
          key: socketKey,
          nodeId: nodeId,
          element: ref,
          payload: payload
        }
      });
    },
    unmount: function unmount(ref) {
      return emit({
        type: 'unmount',
        data: {
          element: ref
        }
      });
    }
  }));
}

var _templateObject$9, _templateObject2$2;
var NodeStyles = styled.div(_templateObject$9 || (_templateObject$9 = _taggedTemplateLiteral(["\n    background: ", ";\n    border: 2px solid #4e58bf;\n    border-radius: 10px;\n    cursor: pointer;\n    box-sizing: border-box;\n    width: ", ";\n    height: ", ";\n    padding-bottom: 6px;\n    position: relative;\n    user-select: none;\n    line-height: initial;\n    font-family: Arial;\n\n    &:hover {\n        background: lighten(", ",4%);\n    }\n    ", "\n    .title {\n        color: white;\n        font-family: sans-serif;\n        font-size: 18px;\n        padding: 8px;\n    }\n    .output {\n        text-align: right;\n    }\n    .input {\n        text-align: left;\n    }\n    .output-socket {\n        text-align: right;\n        margin-right: -", "px;\n        display: inline-block;\n    }\n    .input-socket {\n        text-align: left;\n        margin-left: -", "px;\n        display: inline-block;\n    }\n    .input-title,.output-title {\n        vertical-align: middle;\n        color: white;\n        display: inline-block;\n        font-family: sans-serif;\n        font-size: 14px;\n        margin: ", "px;\n        line-height: ", "px;\n    }\n    .input-control {\n        z-index: 1;\n        width: calc(100% - ", "px);\n        vertical-align: middle;\n        display: inline-block;\n    }\n    .control {\n        display: block;\n        padding: ", "px ", "px;\n    }\n    ", "\n"])), $nodecolor, function (props) {
  return Number.isFinite(props.width) ? "".concat(props.width, "px") : "".concat($nodewidth, "px");
}, function (props) {
  return Number.isFinite(props.height) ? "".concat(props.height, "px") : 'auto';
}, $nodecolor, function (props) {
  return props.selected && css(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral(["\n        background: ", ";\n        border-color: #e3c000;\n    "])), $nodecolorselected);
}, $socketsize / 2 + $socketmargin, $socketsize / 2 + $socketmargin, $socketmargin, $socketsize, $socketsize + 2 * $socketmargin, $socketmargin, $socketsize / 2 + $socketmargin, function (props) {
  return props.styles && props.styles(props);
});
function sortByIndex(entries) {
  entries.sort(function (a, b) {
    var _a$, _b$;
    var ai = ((_a$ = a[1]) === null || _a$ === void 0 ? void 0 : _a$.index) || 0;
    var bi = ((_b$ = b[1]) === null || _b$ === void 0 ? void 0 : _b$.index) || 0;
    return ai - bi;
  });
}
// eslint-disable-next-line max-statements
function Node(props) {
  var inputs = Object.entries(props.data.inputs);
  var outputs = Object.entries(props.data.outputs);
  var controls = Object.entries(props.data.controls);
  var selected = props.data.selected || false;
  var _props$data = props.data,
    id = _props$data.id,
    label = _props$data.label,
    width = _props$data.width,
    height = _props$data.height;
  sortByIndex(inputs);
  sortByIndex(outputs);
  sortByIndex(controls);
  return /*#__PURE__*/React.createElement(NodeStyles, {
    selected: selected,
    width: width,
    height: height,
    styles: props.styles,
    "data-testid": "node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title",
    "data-testid": "title"
  }, label), outputs.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      output = _ref2[1];
    return output && /*#__PURE__*/React.createElement("div", {
      className: "output",
      key: key,
      "data-testid": "output-".concat(key)
    }, /*#__PURE__*/React.createElement("div", {
      className: "output-title",
      "data-testid": "output-title"
    }, output === null || output === void 0 ? void 0 : output.label), /*#__PURE__*/React.createElement(RefSocket, {
      name: "output-socket",
      side: "output",
      socketKey: key,
      nodeId: id,
      emit: props.emit,
      payload: output.socket,
      "data-testid": "output-socket"
    }));
  }), controls.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      control = _ref4[1];
    return control ? /*#__PURE__*/React.createElement(RefControl, {
      key: key,
      name: "control",
      emit: props.emit,
      payload: control,
      "data-testid": "control-".concat(key)
    }) : null;
  }), inputs.map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      key = _ref6[0],
      input = _ref6[1];
    return input && /*#__PURE__*/React.createElement("div", {
      className: "input",
      key: key,
      "data-testid": "input-".concat(key)
    }, /*#__PURE__*/React.createElement(RefSocket, {
      name: "input-socket",
      side: "input",
      socketKey: key,
      nodeId: id,
      emit: props.emit,
      payload: input.socket,
      "data-testid": "input-socket"
    }), input && (!input.control || !input.showControl) && /*#__PURE__*/React.createElement("div", {
      className: "input-title",
      "data-testid": "input-title"
    }, input === null || input === void 0 ? void 0 : input.label), (input === null || input === void 0 ? void 0 : input.control) && (input === null || input === void 0 ? void 0 : input.showControl) && /*#__PURE__*/React.createElement(RefControl, {
      key: key,
      name: "input-control",
      emit: props.emit,
      payload: input.control,
      "data-testid": "input-control"
    }));
  }));
}

var _templateObject$8, _templateObject2$1;
var Styles$4 = styled.div(_templateObject$8 || (_templateObject$8 = _taggedTemplateLiteral(["\n    display: inline-block;\n    cursor: pointer;\n    border: 1px solid white;\n    border-radius: ", "px;\n    width: ", "px;\n    height: ", "px;\n    vertical-align: middle;\n    background: ", ";\n    z-index: 2;\n    box-sizing: border-box;\n    &:hover {\n      border-width: 4px;\n    }\n    &.multiple {\n      border-color: yellow;\n    }\n"])), $socketsize / 2.0, $socketsize, $socketsize, $socketcolor);
var Hoverable = styled.div(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["\n    border-radius: ", "px;\n    padding: ", "px;\n    &:hover ", " {\n      border-width: 4px;\n    }\n"])), ($socketsize + $socketmargin * 2) / 2.0, $socketmargin, Styles$4);
function Socket(props) {
  return /*#__PURE__*/React.createElement(Hoverable, null, /*#__PURE__*/React.createElement(Styles$4, {
    title: props.data.name
  }));
}

/**
 * Classic preset for rendering nodes, connections, controls and sockets.
 */
function setup$3(props) {
  var positionWatcher = typeof (props === null || props === void 0 ? void 0 : props.socketPositionWatcher) === 'undefined' ? getDOMSocketPosition() : props === null || props === void 0 ? void 0 : props.socketPositionWatcher;
  var _ref = (props === null || props === void 0 ? void 0 : props.customize) || {},
    node = _ref.node,
    connection = _ref.connection,
    socket = _ref.socket,
    control = _ref.control;
  return {
    attach: function attach(plugin) {
      positionWatcher.attach(plugin);
    },
    // eslint-disable-next-line max-statements, complexity
    render: function render(context, plugin) {
      if (context.data.type === 'node') {
        var parent = plugin.parentScope();
        var Component = node ? node(context.data) : Node;
        return Component && /*#__PURE__*/React.createElement(Component, {
          data: context.data.payload,
          emit: function emit(data) {
            return parent.emit(data);
          }
        });
      } else if (context.data.type === 'connection') {
        var _Component = connection ? connection(context.data) : Connection;
        var payload = context.data.payload;
        var sourceOutput = payload.sourceOutput,
          targetInput = payload.targetInput,
          source = payload.source,
          target = payload.target;
        return _Component && /*#__PURE__*/React.createElement(ConnectionWrapper, {
          start: context.data.start || function (change) {
            return positionWatcher.listen(source, 'output', sourceOutput, change);
          },
          end: context.data.end || function (change) {
            return positionWatcher.listen(target, 'input', targetInput, change);
          },
          path: /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(start, end) {
              var response, _response$data, path, points, curvature;
              return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return plugin.emit({
                      type: 'connectionpath',
                      data: {
                        payload: payload,
                        points: [start, end]
                      }
                    });
                  case 2:
                    response = _context.sent;
                    if (response) {
                      _context.next = 5;
                      break;
                    }
                    return _context.abrupt("return", '');
                  case 5:
                    _response$data = response.data, path = _response$data.path, points = _response$data.points;
                    curvature = 0.3;
                    if (!(!path && points.length !== 2)) {
                      _context.next = 9;
                      break;
                    }
                    throw new Error('cannot render connection with a custom number of points');
                  case 9:
                    if (path) {
                      _context.next = 11;
                      break;
                    }
                    return _context.abrupt("return", payload.isLoop ? loopConnectionPath(points, curvature, 120) : classicConnectionPath(points, curvature));
                  case 11:
                    return _context.abrupt("return", path);
                  case 12:
                  case "end":
                    return _context.stop();
                }
              }, _callee);
            }));
            return function (_x, _x2) {
              return _ref2.apply(this, arguments);
            };
          }()
        }, /*#__PURE__*/React.createElement(_Component, {
          data: context.data.payload
        }));
      } else if (context.data.type === 'socket') {
        var _Component2 = socket ? socket(context.data) : Socket;
        return _Component2 && context.data.payload && /*#__PURE__*/React.createElement(_Component2, {
          data: context.data.payload
        });
      } else if (context.data.type === 'control') {
        var _Component3 = control && context.data.payload ? control(context.data) : context.data.payload instanceof ClassicPreset.InputControl ? Control : null;
        return _Component3 && /*#__PURE__*/React.createElement(_Component3, {
          data: context.data.payload
        });
      }
    }
  };
}

var index$4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  vars: vars,
  setup: setup$3,
  Connection: Connection,
  useConnection: useConnection,
  Control: Control,
  InputControl: Control,
  Node: Node,
  NodeStyles: NodeStyles,
  RefControl: RefControl,
  RefSocket: RefSocket,
  Socket: Socket
});

function useDebounce(cb, timeout) {
  var ref = useRef();
  function cancel() {
    ref.current && clearTimeout(ref.current);
  }
  var func = function func() {
    cancel();
    ref.current = setTimeout(function () {
      cb();
    }, timeout);
  };
  useEffect(function () {
    return cancel;
  }, []);
  return [func, cancel];
}

var $contextColor = 'rgba(110,136,255,0.8)';
var $contextColorLight = 'rgba(130, 153, 255, 0.8)';
var $contextColorDark = 'rgba(69, 103, 255, 0.8)';
var $contextMenuRound = '5px';
var $width = 120;

var _templateObject$7;
var CommonStyle = styled.div(_templateObject$7 || (_templateObject$7 = _taggedTemplateLiteral(["\n  color: #fff;\n  padding: 4px;\n  border-bottom: 1px solid ", ";\n  background-color: ", ";\n  cursor: pointer;\n  width: 100%;\n  position: relative;\n  &:first-child {\n    border-top-left-radius: ", ";\n    border-top-right-radius: ", ";\n  }\n  &:last-child {\n    border-bottom-left-radius: ", ";\n    border-bottom-right-radius: ", ";\n  }\n  &:hover {\n    background-color: ", ";\n  }\n"])), $contextColorDark, $contextColor, $contextMenuRound, $contextMenuRound, $contextMenuRound, $contextMenuRound, $contextColorLight);

var _templateObject$6, _templateObject2, _templateObject3;
var ItemStyle = styled(CommonStyle)(_templateObject$6 || (_templateObject$6 = _taggedTemplateLiteral(["\n    ", "\n"])), function (props) {
  return props.hasSubitems && css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["&:after {\n    content: '\u25BA';\n    position: absolute;\n    opacity: 0.6;\n    right: 5px;\n    top: 5px;\n    }"])));
});
var SubitemStyles = styled.div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    position: absolute;\n    top: 0;\n    left: 100%;\n    width: ", "px;\n"])), $width);
function ItemElement(props) {
  var _props$components, _props$components$ite, _props$components2, _props$components2$su;
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    visibleSubitems = _React$useState2[0],
    setVisibleSubitems = _React$useState2[1];
  var setInvisibile = React.useCallback(function () {
    return setVisibleSubitems(false);
  }, [setVisibleSubitems]);
  var _useDebounce = useDebounce(setInvisibile, props.delay),
    _useDebounce2 = _slicedToArray(_useDebounce, 2),
    hide = _useDebounce2[0],
    cancelHide = _useDebounce2[1];
  var Component = ((_props$components = props.components) === null || _props$components === void 0 ? void 0 : (_props$components$ite = _props$components.item) === null || _props$components$ite === void 0 ? void 0 : _props$components$ite.call(_props$components, props.data)) || ItemStyle;
  var Subitems = ((_props$components2 = props.components) === null || _props$components2 === void 0 ? void 0 : (_props$components2$su = _props$components2.subitems) === null || _props$components2$su === void 0 ? void 0 : _props$components2$su.call(_props$components2, props.data)) || SubitemStyles;
  return /*#__PURE__*/React.createElement(Component, {
    onClick: function onClick(e) {
      e.stopPropagation();
      props.data.handler();
      props.hide();
    },
    hasSubitems: Boolean(props.data.subitems),
    onPointerDown: function onPointerDown(e) {
      return e.stopPropagation();
    },
    onPointerOver: function onPointerOver() {
      cancelHide();
      setVisibleSubitems(true);
    },
    onPointerLeave: function onPointerLeave() {
      return hide && hide();
    },
    "data-testid": "context-menu-item"
  }, props.children, props.data.subitems && visibleSubitems && /*#__PURE__*/React.createElement(Subitems, null, props.data.subitems.map(function (item) {
    return /*#__PURE__*/React.createElement(ItemElement, {
      key: item.key,
      data: item,
      delay: props.delay,
      hide: props.hide,
      components: props.components
    }, item.label);
  })));
}

var _templateObject$5;
var SearchInput = styled.input(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral(["\n  color: white;\n  padding: 1px 8px;\n  border: 1px solid white;\n  border-radius: 10px;\n  font-size: 16px;\n  font-family: serif;\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n"])));
function Search(props) {
  var Component = props.component || SearchInput;
  return /*#__PURE__*/React.createElement(Component, {
    value: props.value,
    onInput: function onInput(e) {
      return props.onChange(e.target.value);
    },
    onPointerDown: function onPointerDown(e) {
      return e.stopPropagation();
    },
    "data-testid": "context-menu-search-input"
  });
}

var _templateObject$4;
var Styles$3 = styled.div(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral(["\n  padding: 10px;\n  width: ", "px;\n  margin-top: -20px;\n  margin-left: -", "px;\n"])), $width, $width / 2);
function Menu(props) {
  var _props$components, _props$components$mai, _props$components2, _props$components2$co, _props$components3, _props$components3$se;
  var _useDebounce = useDebounce(props.onHide, props.delay),
    _useDebounce2 = _slicedToArray(_useDebounce, 2),
    hide = _useDebounce2[0],
    cancelHide = _useDebounce2[1];
  var _React$useState = React.useState(''),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    filter = _React$useState2[0],
    setFilter = _React$useState2[1];
  var filterRegexp = new RegExp(filter, 'i');
  var filteredList = props.items.filter(function (item) {
    return item.label.match(filterRegexp);
  });
  var Component = ((_props$components = props.components) === null || _props$components === void 0 ? void 0 : (_props$components$mai = _props$components.main) === null || _props$components$mai === void 0 ? void 0 : _props$components$mai.call(_props$components)) || Styles$3;
  var Common = ((_props$components2 = props.components) === null || _props$components2 === void 0 ? void 0 : (_props$components2$co = _props$components2.common) === null || _props$components2$co === void 0 ? void 0 : _props$components2$co.call(_props$components2)) || CommonStyle;
  return /*#__PURE__*/React.createElement(Component, {
    onMouseOver: function onMouseOver() {
      return cancelHide();
    },
    onMouseLeave: function onMouseLeave() {
      return hide && hide();
    },
    onWheel: function onWheel(e) {
      return e.stopPropagation();
    },
    "data-testid": "context-menu"
  }, props.searchBar && /*#__PURE__*/React.createElement(Common, null, /*#__PURE__*/React.createElement(Search, {
    value: filter,
    onChange: setFilter,
    component: (_props$components3 = props.components) === null || _props$components3 === void 0 ? void 0 : (_props$components3$se = _props$components3.search) === null || _props$components3$se === void 0 ? void 0 : _props$components3$se.call(_props$components3)
  })), filteredList.map(function (item) {
    return /*#__PURE__*/React.createElement(ItemElement, {
      key: item.key,
      data: item,
      delay: props.delay,
      hide: props.onHide,
      components: props.components
    }, item.label);
  }));
}

/**
 * Preset for rendering context menu.
 */
function setup$2(props) {
  var delay = typeof (props === null || props === void 0 ? void 0 : props.delay) === 'undefined' ? 1000 : props.delay;
  return {
    render: function render(context) {
      if (context.data.type === 'contextmenu') {
        return /*#__PURE__*/React.createElement(Menu, {
          items: context.data.items,
          delay: delay,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide,
          components: props === null || props === void 0 ? void 0 : props.customize
        });
      }
    }
  };
}

var index$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$2,
  Item: ItemStyle,
  Subitems: SubitemStyles,
  Menu: Styles$3,
  Search: SearchInput,
  Common: CommonStyle
});

(undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function useElementSize() {
    const [ref, setRef] = useState(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });
    const handleSize = useCallback(() => {
        setSize({
            width: (ref === null || ref === void 0 ? void 0 : ref.offsetWidth) || 0,
            height: (ref === null || ref === void 0 ? void 0 : ref.offsetHeight) || 0,
        });
    }, [ref === null || ref === void 0 ? void 0 : ref.offsetHeight, ref === null || ref === void 0 ? void 0 : ref.offsetWidth]);
    useEventListener('resize', handleSize);
    useIsomorphicLayoutEffect(() => {
        handleSize();
    }, [ref === null || ref === void 0 ? void 0 : ref.offsetHeight, ref === null || ref === void 0 ? void 0 : ref.offsetWidth]);
    return [setRef, size];
}

function useEventListener(eventName, handler, element, options) {
    const savedHandler = useRef(handler);
    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);
    useEffect(() => {
        var _a;
        const targetElement = (_a = element === null || element === void 0 ? void 0 : element.current) !== null && _a !== void 0 ? _a : window;
        if (!(targetElement && targetElement.addEventListener))
            return;
        const listener = event => savedHandler.current(event);
        targetElement.addEventListener(eventName, listener, options);
        return () => {
            targetElement.removeEventListener(eventName, listener, options);
        };
    }, [eventName, element, options]);
}

(undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function px(value) {
  return "".concat(value, "px");
}

var _templateObject$3;
var Styles$2 = styled.div(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral(["\n    position: absolute;\n    background: #7C43C5;\n    border: 1px solid #7C43C5;\n"])));
function MiniNode(props) {
  return /*#__PURE__*/React.createElement(Styles$2, {
    style: {
      left: px(props.left),
      top: px(props.top),
      width: px(props.width),
      height: px(props.height)
    },
    className: "minimap-node",
    "data-testid": "minimap-node"
  });
}

var _templateObject$2;
var MiniViewportStyles = styled.div(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral(["\n  position: absolute;\n  background: #090E2CCC;\n  border: 1px solid #121D64;\n"])));
function MiniViewport(props) {
  var scale = function scale(v) {
    return v * props.containerWidth;
  };
  var invert = function invert(v) {
    return v / props.containerWidth;
  };
  var drag = useDrag(function (dx, dy) {
    return props.translate(invert(-dx), invert(-dy));
  }, function (e) {
    return {
      x: e.pageX,
      y: e.pageY
    };
  });
  return /*#__PURE__*/React.createElement(MiniViewportStyles, {
    id: "minimap-viewport",
    onPointerDown: drag.start,
    style: {
      left: px(scale(props.left)),
      top: px(scale(props.top)),
      width: px(scale(props.width)),
      height: px(scale(props.height))
    },
    "data-testid": "minimap-viewport"
  });
}

var _templateObject$1;
var Styles$1 = styled.div(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n    position: absolute;\n    right: 24px;\n    bottom: 24px;\n    background: #010418;\n    padding: 20px;\n    overflow: hidden;\n    border: 2px solid #3C2857;\n    border-radius: 8px;\n    box-sizing: border-box;\n    transform: translateX(-175%);\n    transition: transform 0.5s ease;\n"])));
function Minimap(props) {
  var container = useRef();
  var _useElementSize = useElementSize(),
    _useElementSize2 = _slicedToArray(_useElementSize, 2),
    containerRef = _useElementSize2[0],
    containerWidth = _useElementSize2[1].width;
  var scale = function scale(v) {
    return v * containerWidth;
  };
  var ref = useCallback(function (node) {
    container.current = node;
    containerRef(node);
  }, [containerRef]);
  return /*#__PURE__*/React.createElement(Styles$1, {
    size: props.size,
    id: "minimap",
    style: {
      width: px(props.size * props.ratio),
      height: px(props.size)
    },
    onPointerDown: function onPointerDown(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    onDoubleClick: function onDoubleClick(e) {
      e.stopPropagation();
      e.preventDefault();
      if (!container.current) return;
      var box = container.current.getBoundingClientRect();
      var x = (e.clientX - box.left) / (props.size * props.ratio);
      var y = (e.clientY - box.top) / (props.size * props.ratio);
      props.point(x, y);
    },
    ref: ref,
    "data-testid": "minimap"
  }, containerWidth && props.nodes.map(function (node, i) {
    return /*#__PURE__*/React.createElement(MiniNode, {
      key: i,
      left: scale(node.left),
      top: scale(node.top),
      width: scale(node.width),
      height: scale(node.height)
    });
  }), /*#__PURE__*/React.createElement(MiniViewport, _extends({}, props.viewport, {
    start: props.start,
    containerWidth: containerWidth,
    translate: props.translate
  })));
}

/**
 * Preset for rendering minimap.
 */
function setup$1(props) {
  return {
    render: function render(context) {
      if (context.data.type === 'minimap') {
        return /*#__PURE__*/React.createElement(Minimap, {
          nodes: context.data.nodes,
          size: (props === null || props === void 0 ? void 0 : props.size) || 200,
          ratio: context.data.ratio,
          viewport: context.data.viewport,
          start: context.data.start,
          translate: context.data.translate,
          point: context.data.point
        });
      }
    }
  };
}

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$1
});

var _templateObject;
var pinSize = 20;
var Styles = styled.div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  width: ", "px;\n  height: ", "px;\n  box-sizing: border-box;\n  background: ", ";\n  border: 2px solid white;\n  border-radius: ", "px;\n"])), pinSize, pinSize, function (props) {
  return props.selected ? '#ffd92c' : 'steelblue';
}, pinSize);
function Pin(props) {
  var drag = useDrag(function (dx, dy) {
    return props.translate(dx, dy);
  }, props.pointer);
  var _props$position = props.position,
    x = _props$position.x,
    y = _props$position.y;
  return /*#__PURE__*/React.createElement(Styles, {
    onPointerDown: function onPointerDown(e) {
      e.stopPropagation();
      e.preventDefault();
      drag.start(e);
      props.pointerdown();
    },
    onContextMenu: function onContextMenu(e) {
      e.stopPropagation();
      e.preventDefault();
      props.contextMenu();
    },
    selected: props.selected,
    style: {
      position: 'absolute',
      top: "".concat(y - pinSize / 2, "px"),
      left: "".concat(x - pinSize / 2, "px")
    },
    "data-testid": "pin"
  });
}

/**
 * Preset for rendering pins.
 */
function setup(props) {
  function renderPins(data, pointer) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, data.pins.map(function (pin) {
      return /*#__PURE__*/React.createElement(Pin, _extends({}, pin, {
        key: pin.id,
        contextMenu: function contextMenu() {
          return (props === null || props === void 0 ? void 0 : props.contextMenu) && props.contextMenu(pin.id);
        },
        translate: function translate(dx, dy) {
          return (props === null || props === void 0 ? void 0 : props.translate) && props.translate(pin.id, dx, dy);
        },
        pointerdown: function pointerdown() {
          return (props === null || props === void 0 ? void 0 : props.pointerdown) && props.pointerdown(pin.id);
        },
        pointer: pointer
      }));
    }));
  }
  return {
    render: function render(context, plugin) {
      var data = context.data;
      var area = plugin.parentScope(BaseAreaPlugin);
      if (data.type === 'reroute-pins') {
        return renderPins(data.data, function () {
          return area.area.pointer;
        });
      }
    }
  };
}

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup
});

/**
 * Built-in presets, responsible for rendering different parts of the editor.
 * @module
 */

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  classic: index$4,
  contextMenu: index$3,
  minimap: index$2,
  reroute: index$1
});

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Signals that can be emitted by the plugin
 * @priority 9
 */

/**
 * Plugin props
 */

/**
 * React plugin. Renders nodes, connections and other elements using React.
 * @priority 10
 * @emits connectionpath
 * @listens render
 * @listens unmount
 */
var ReactPlugin = /*#__PURE__*/function (_Scope) {
  _inherits(ReactPlugin, _Scope);
  var _super = _createSuper(ReactPlugin);
  function ReactPlugin(props) {
    var _this;
    _classCallCheck(this, ReactPlugin);
    _this = _super.call(this, 'react-render');
    _defineProperty(_assertThisInitialized(_this), "presets", []);
    _this.renderer = getRenderer({
      createRoot: props === null || props === void 0 ? void 0 : props.createRoot
    });
    _this.addPipe(function (context) {
      if (!context || _typeof(context) !== 'object' || !('type' in context)) return context;
      if (context.type === 'unmount') {
        _this.unmount(context.data.element);
      } else if (context.type === 'render') {
        if ('filled' in context.data && context.data.filled) {
          return context;
        }
        if (_this.mount(context.data.element, context)) {
          return _objectSpread(_objectSpread({}, context), {}, {
            data: _objectSpread(_objectSpread({}, context.data), {}, {
              filled: true
            })
          });
        }
      }
      return context;
    });
    return _this;
  }
  _createClass(ReactPlugin, [{
    key: "setParent",
    value: function setParent(scope) {
      var _this2 = this;
      _get(_getPrototypeOf(ReactPlugin.prototype), "setParent", this).call(this, scope);
      this.presets.forEach(function (preset) {
        if (preset.attach) preset.attach(_this2);
      });
    }
  }, {
    key: "mount",
    value: function mount(element, context) {
      var parent = this.parentScope();
      var _iterator = _createForOfIteratorHelper(this.presets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var preset = _step.value;
          var result = preset.render(context, this);
          if (!result) continue;
          var reactElement = /*#__PURE__*/React.createElement(Root, {
            rendered: function rendered() {
              return parent.emit({
                type: 'rendered',
                data: context.data
              });
            }
          }, result);
          this.renderer.mount(reactElement, element);
          return true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "unmount",
    value: function unmount(element) {
      this.renderer.unmount(element);
    }

    /**
     * Adds a preset to the plugin.
     * @param preset Preset that can render nodes, connections and other elements.
     */
  }, {
    key: "addPreset",
    value: function addPreset(preset) {
      var local = preset;
      if (local.attach) local.attach(this);
      this.presets.push(local);
    }
  }]);
  return ReactPlugin;
}(Scope);

export { drag as Drag, index as Presets, ReactPlugin, RefComponent, useRete };
//# sourceMappingURL=rete-react-plugin.esm.js.map
