// main file
$( "select[name='herolist']" )
    .selectpicker( {
        style: 'btn-primary',
        menuStyle: 'dropdown-inverse'
    } );

$( function () {
    var select = $( "#minbeds" );
    var slider = $( "<div id='slider' class='ui-slider'></div>" )
        .insertAfter( select )
        .slider( {
            min: 1,
            max: 6,
            range: "min",
            value: select[ 0 ].selectedIndex + 1,
            slide: function ( event, ui ) {
                select[ 0 ].selectedIndex = ui.value - 1;
            }

        } );
    $( "#minbeds" )
        .change( function () {
            slider.slider( "value", this.selectedIndex + 1 );
        } );
} );
