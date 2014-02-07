/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @description Read contents of file
 * @requires Class APISupport
 */
define(['src/lib/core/filereader/APISupport', 'src/lib/core/filereader/Read'], function(bAPISupport, aRead) {

    var _aFiles = [];

    // Check File API Support 
    var _checkAPISupport = function() {

        console.log("File API supported: " + bAPISupport());

    };

    // Set file objects 
    var _setFiles = function(oFileList) {

        if (bAPISupport()) {

            _aFiles = aRead(oFileList);

        }

    };

    // Get file objects as Array 
    var _getFiles = function() {

        return _aFiles;

    };

    // Exposed methods
    return {

        supported: _checkAPISupport,
        open: _setFiles,
        getFiles: _getFiles

    };

});
