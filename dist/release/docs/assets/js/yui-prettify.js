/*javascript-sound-models - v1.0.2 - 2014-07-02 */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library.");

YUI().use('node', function(Y) {
    var code = Y.all('.prettyprint.linenums');
    if (code.size()) {
        code.each(function(c) {
            var lis = c.all('ol li'),
                l = 1;
            lis.each(function(n) {
                n.prepend('<a name="LINENUM_' + l + '"></a>');
                l++;
            });
        });
        var h = location.hash;
        location.hash = '';
        h = h.replace('LINE_', 'LINENUM_');
        location.hash = h;
    }
});
