import React, {
    Component,
    PropTypes
} from 'react';
import {
    View,
    LayoutAnimation
} from 'react-native';
import LayzloadManager from './LayzloadManager';
import Anim from './Anim';

let id = 0;

class LazyloadView extends Component{
    static displayName = 'LazyloadView';

    static propTypes = {
        host: PropTypes.string,
        initialVisibility: PropTypes.bool,
        animation: PropTypes.oneOfType([
            PropTypes.shape({
                duration: PropTypes.number,
                create: Anim,
                update: Anim,
                delete: Anim
            }),
            PropTypes.bool
        ]),
        ...View.propTypes
    };

    static defaultProps = {
        initialVisibility: false,
        animation: {
            duration: 350,
            create: {
                property: LayoutAnimation.Properties.opacity,
                type: 'easeIn'
            }
        }
    };

    constructor() {
        super(...arguments);
        if (this.props.host) {
            this._id = id++;
            this._visible = this.props.initialVisibility;
            this.state = {
                visible: this._visible
            };
        }
    };

    componentWillUnmount = () => {
        if (this.props.host) {
            LayzloadManager.remove(this.props.host, this._id);
        }
        this._unmounted = true;
    };

    shouldComponentUpdate = (nextProps) => {
        return this._visible || !nextProps.host;
    };

    _root = null;
    _visible = false;
    _timeout = null;
    _unmounted = false;

    _toggle = visible => {
        if (this._visible !== visible) {
            this._visible = visible;
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => {
                if (this._unmounted) {
                    return;
                }

                visible && this.props.animation && LayoutAnimation.configureNext(this.props.animation);
                this.setState({
                    visible
                });
            }, 16);
        }
    };

    measureInWindow = (...args) => {
        if (this._unmounted || !this._root) return;
        this._root.measureInWindow(...args);
    };

    measureLayout = (...args) => {
        if (this._unmounted || !this._root) return;
        this._root.measureLayout(...args);
    };

    setNativeProps = (...args) => {
        if (this._unmounted || !this._root) return;
        this._root.setNativeProps(...args);
    };

    focus = (...args) => {
        if (this._unmounted || !this._root) return;
        this._root.focus(...args);
    };

    blur = (...args) => {
        if (this._unmounted || !this._root) return;
        this._root.blur(...args);
    };

    _onLayout = (...args) => {
        if (this._unmounted) {
            return;
        }
        this.props.onLayout && this.props.onLayout(...args);
        LayzloadManager.add(
            {
                name: this.props.host,
                id: this._id
            },
            this.measureLayout,
            this._toggle
        );
    };

    render() {
        return this.props.host ? <View
            {...this.props}
            ref={ele => this._root = ele}
            onLayout={this._onLayout}
        >
            {this.state.visible ? this.props.children : null}
        </View> : <View
            ref={ele => this._root = ele}
            {...this.props}
        />;
    }
}

export default LazyloadView;
