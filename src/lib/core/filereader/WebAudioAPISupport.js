/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @name core.filereader.APISupport
 * @description Check if browser supports the File API
 * @return {Boolean} True if File API is supported; False if File API is not supported
 */
define(function() {

    return function() {

        if (window.File && window.FileReader && window.FileList && window.Blob) {

            return true;

        }

        return false;

    };

});
