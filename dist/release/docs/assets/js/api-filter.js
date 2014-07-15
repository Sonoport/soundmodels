/*javascript-sound-models - v1.0.2 - 2014-07-15 */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library.");

YUI.add('api-filter', function (Y) {

Y.APIFilter = Y.Base.create('apiFilter', Y.Base, [Y.AutoCompleteBase], {
    // -- Initializer ----------------------------------------------------------
    initializer: function () {
        this._bindUIACBase();
        this._syncUIACBase();
    },
    getDisplayName: function(name) {

        Y.each(Y.YUIDoc.meta.allModules, function(i) {
            if (i.name === name && i.displayName) {
                name = i.displayName;
            }
        });

        return name;
    }

}, {
    // -- Attributes -----------------------------------------------------------
    ATTRS: {
        resultHighlighter: {
            value: 'phraseMatch'
        },

        // May be set to "classes" or "modules".
        queryType: {
            value: 'classes'
        },

        source: {
            valueFn: function() {
                var self = this;
                return function(q) {
                    var data = Y.YUIDoc.meta[self.get('queryType')],
                        out = [];
                    Y.each(data, function(v) {
                        if (v.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                            out.push(v);
                        }
                    });
                    return out;
                };
            }
        }
    }
});

}, '3.4.0', {requires: [
    'autocomplete-base', 'autocomplete-highlighters', 'autocomplete-sources'
]});
