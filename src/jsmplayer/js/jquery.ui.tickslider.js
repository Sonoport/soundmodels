/*!
 * Copyright (c) 2012 Ben Olson (https://github.com/bseth99/jquery-ui-extensions)
 * jQuery UI LabeledSlider @VERSION
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * Depends:
 * jquery.ui.core.js
 * jquery.ui.widget.js
 * jquery.ui.mouse.js
 * jquery.ui.slider.js
 */
( function ( $, undefined ) {
    // Custom labeled and ticks for jQuery UI slider

    $.widget( "ui.tickslider", $.ui.slider, {

        options: {
            tickInterval: 1,
            tickArray: [],
            tweenLabels: true,
            tickLabels: null,
            makeStep: false,
            step: 0.01
        },

        uiSlider: null,
        tickInterval: 1,
        tweenLabels: true,

        _create: function () {

            this._detectOrientation();

            this.uiSlider = this.element.wrap( '<div class="ui-slider-wrapper ui-widget"></div>' )
                .before( '<div class="ui-slider-labels"></div>' )
                .parent()
                .addClass( this.orientation )
                .css( 'font-size', this.element.css( 'font-size' ) );

            this._super();

            this.element.removeClass( 'ui-widget' );

            this._alignWithStep();

            if ( this.orientation === 'horizontal' ) {
                this.uiSlider
                    .width( this.element.css( 'width' ) );
            } else {
                this.uiSlider
                    .height( this.element.css( 'height' ) );
            }

            this._drawLabels();
        },
        _drawLabels: function () {
            var labels = this.options.tickLabels || {},
                $lbl = this.uiSlider.children( '.ui-slider-labels' ),
                dir = this.orientation === 'horizontal' ? 'left' : 'bottom',
                min = this.options.min,
                max = this.options.max,
                inr = this.tickInterval,
                steps = this.options.makeStep,
                cnt = Math.abs( max - min ),
                label;

            $lbl.html( '' );

            this.options.tickArray = this._adjustTicks( min, max );
            var tickArray = this.options.tickArray;
            var ta = tickArray.length > 0;

            //console.log( this.options.tickArray.length, this.tickInterval );

            for ( var i = 0; i < tickArray.length; i++ ) {
                label = labels[ i + min ] ? labels[ i + min ] : ( this.options.tweenLabels ? i + min : '' );
                $( '<div>' )
                    .addClass( 'ui-slider-label-ticks' )
                    .css( dir, ( this._percentage( i * this.tickInterval, cnt ) + '%' ) )
                //.html( '<span>' + ( label ) + '</span>' )
                .appendTo( $lbl );

            }

        },
        _setOption: function ( key, value ) {

            this._super( key, value );

            switch ( key ) {

            case 'tickInterval':
            case 'tickLabels':
            case 'tickArray':
            case 'min':
            case 'max':
            case 'step':

                this._alignWithStep();
                this._drawLabels();
                break;

            case 'orientation':

                this.element
                    .removeClass( 'horizontal vertical' )
                    .addClass( this.orientation );

                this._drawLabels();
                break;
            }
        },
        _adjustTicks: function ( min, max ) {
            var MAXTICKS = 30;
            var MINTICKS = 3;
            var cnt = Math.abs( max - min ),
                inr = this.tickInterval,
                tickArray = [],
                ta = tickArray.length > 0,
                tickVal;
            // adjust ticks
            // If there too many ticks, use a bigger tick interval
            while ( cnt / inr > MAXTICKS ) {
                inr *= 10;
            }

            // If there too few ticks, use smaller tick interval
            while ( cnt / inr < MINTICKS ) {
                inr /= 10;
            }

            tickVal = inr * Math.ceil( min / inr );
            while ( tickVal <= max ) {
                tickArray.push( tickVal );
                tickVal += inr;

            }
            this.tickInterval = inr;

            return tickArray;
        },
        _percentage: function ( val, total ) {

            var percentVal = ( val / total ) * 100;

            return percentVal;

        },
        _alignWithStep: function () {
            if ( this.options.makeStep ) // Snap ticks to the step
                this.tickInterval = this.options.step;
            else
                this.tickInterval = this.options.tickInterval;
        },

        _destroy: function () {
            this._super();
            this.uiSlider.replaceWith( this.element );
        },

        widget: function () {
            return this.uiSlider;
        }

    } );
}( jQuery ) );
