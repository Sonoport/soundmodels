/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @description Read contents of file
 * @requires Class APISupport
 */
define(['src/lib/core/filereader/APISupport', 'src/lib/core/filereader/Read'], function(bAPISupport, aRead) {

    var _aFiles = [];

    // Check File API Support 
    var APISupport = function() {

        console.log("File API supported: " + bAPISupport());

    };

    // Handle file objects 
    var Open = function(oFileList) {

        if (bAPISupport()) {

            _aFiles = aRead(oFileList);

        }

    };

    return {

        supported: APISupport,
        open: Open

    };

});
