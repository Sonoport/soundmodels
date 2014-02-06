/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @description Read contents of file
 */
define(['src/lib/core/filereader/APISupport'], function(bAPISupport) {

    return function(x, y) {

        if (bAPISupport()) {

            console.log("yes!");

        }

        return x * y;

    };

});
