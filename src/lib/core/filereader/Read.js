/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @name core.filereader.Read
 * @description Process the files selected
 * @param {FileList} oFileList FileList object
 * @return {Array} Array of FileList Objects
 */
define(function() {

    return function(oFileList) {

        var _aFiles = [];
        var _files = oFileList;

        for (var i = 0; i < _files.length; i++) {

            _aFiles.push(_files[i]);

        }

        return _aFiles;

    };

});
