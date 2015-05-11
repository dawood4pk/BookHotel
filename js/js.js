/**
 * @author Dawood Butt
 * @description Book Hotel
 * @project Hotel page
 */
$( document ).ready(function() {
	BOOK.HOTEL.init();
});
 _.templateSettings = {
	//Three regexes:
	//interpolate is for <%= ... %>.
	//escape is for <%- ... %>.
	//evaluate is for <% ... %>.
	//////////////////////////////////////////////////////
	evaluate:    /\{\{(.+?)\}\}/g,					   //
    interpolate: /\{\{=(.+?)\}\}/g,					  //
	escape: /\{\{-(.+?)\}\}/g						   //
	//////////////////////////////////////////////////////
};
/////////////////////////////////////////////////
var BOOK = BOOK || {};
BOOK.HOTEL = {};
BOOK.HOTEL = {
			Constants: {},
			Variables: {},
			Functions: {},
			Events: {}
		};

BOOK.HOTEL.Constants.CURRENCY_SYMBOL = 'PKR - ';
BOOK.HOTEL.Variables.reviewsPerPageBlocks = 5;
BOOK.HOTEL.Variables.reviewsCurrentPage = 1;
BOOK.HOTEL.Variables.reviewsShowEachSide = 1;

BOOK.HOTEL.Variables.isEnableReviewsSorting = false;
BOOK.HOTEL.Variables.isEnableRoomOccupancySorting = false;
BOOK.HOTEL.Variables.isEnableRoomPriceSorting = false;

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.init.                                        //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.init = function() {
	if (typeof BOOK.HOTEL.Variables.json === 'undefined') {
		BOOK.HOTEL.Functions.ajaxLoad();
	}
	else
	{
		BOOK.HOTEL.Functions.loadHeader();
		BOOK.HOTEL.Functions.loadPhotos();
		BOOK.HOTEL.Functions.loadDescription();
		BOOK.HOTEL.Functions.loadFacilities();
		BOOK.HOTEL.Functions.loadRooms();
		BOOK.HOTEL.Functions.loadReviews();
		BOOK.HOTEL.Functions.loadFooter();
	}
}; // End of init.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.ajaxLoad.                          //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.ajaxLoad = function() {

	////////
	$.ajax({
		url: BOOK.HOTEL.Functions.serviceLocator('hotel-data'),
		contentType:"application/json; charset=UTF-8",
		dataType: "json",
		cache: true,
		success: function(data) {
			BOOK.HOTEL.Variables.json = data;
			BOOK.HOTEL.Functions.loadHeader();
			BOOK.HOTEL.Functions.loadPhotos();
			BOOK.HOTEL.Functions.loadDescription();
			BOOK.HOTEL.Functions.loadFacilities();
			BOOK.HOTEL.Functions.loadRooms();
			BOOK.HOTEL.Functions.loadReviews();
			BOOK.HOTEL.Functions.loadFooter();
		},
		error: function(e) {
		   //console.log('Hotel Data error:'+e);
		   alert( 'Hotel AJAX error: ' + JSON.stringify( e ) );
		},
		statusCode: {
		404: function() {
				//console.log('Hotel Data 404');
				alert('Hotel AJAX 404');
			}
		}/*,
		async: false*/
	})// End of AJAX call.

}; // End of ajaxLoad.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.serviceLocator.					//
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.serviceLocator = function(service) {
	if (typeof BOOK.HOTEL.Config === 'undefined') {
		
		var $configData = $('#rest-services');
		if ($configData.length > 0) {
			//console.log('Hotel config was found');
			BOOK.HOTEL.Config = JSON.parse($configData.html());
		} else {
			//console.log('Hotel config was NOT found');
		}
	}

	var url = BOOK.HOTEL.Config[service];

	return url;
};// End of serviceLocator.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadHeader.                     //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadHeader = function() {
	document.title = BOOK.HOTEL.Variables.json.hotelName;

	var $headerArea = $('#header-area-template');
	if ($headerArea.length > 0) {
		
		var headerTemplate = _.template($headerArea.html());
		$('#headerContainer').html( headerTemplate( {
							hotelName: BOOK.HOTEL.Variables.json.hotelName,
							hotelRating: BOOK.HOTEL.Variables.json.hotelRating,
							hotelAddress: BOOK.HOTEL.Variables.json.hotelAddress
						} ) );
		google.maps.event.addDomListener( window, 'load', BOOK.HOTEL.Functions.loadGoogleMap( BOOK.HOTEL.Variables.json.hotelLatitude, BOOK.HOTEL.Variables.json.hotelLongitude, BOOK.HOTEL.Variables.json.hotelAddress, BOOK.HOTEL.Variables.json.hotelAddress ) );
	}
					
}; // End of loadHeader.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadGoogleMap.                  //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadGoogleMap = function(lat, lng, myTitle, myContent) {

		var myLatlng = new google.maps.LatLng(lat, lng);
        var mapCanvas = document.getElementById('google-map');
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
		  //////////////////////
		  disableDefaultUI: true,
		  panControl: true,
		  zoomControl: true,
		  zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.DEFAULT
                    },
			mapTypeControl: true,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
			},
			streetViewControl: true,
		  //////////////////////
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
		//////////////////////////////////////////////////
		var map = new google.maps.Map(mapCanvas, mapOptions);
		var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			title: myTitle
		});
		var infowindow = new google.maps.InfoWindow({
			content: myContent
		});
		google.maps.event.addListener(marker, "click", function() {
				infowindow.open(map, marker);
		});
		//////////////////////////////////////////////////
        //var map = new google.maps.Map(mapCanvas, mapOptions)
};// End of loadGoogleMap.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadPhotos.                     //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadPhotos = function() {
	var $photosArea = $('#photos-area-template');

	if ($photosArea.length > 0) {
		var photosTemplate = _.template($photosArea.html());
		$('#photosContainer').html( photosTemplate( {hotelPhotos: BOOK.HOTEL.Variables.json.hotelPhotos} ) );
		BOOK.HOTEL.Functions.loadphotoCarousel();
		BOOK.HOTEL.Functions.registerPhotosEvents();
	}
}; // End of loadPhotos.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadphotoCarousel.              //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadphotoCarousel = function() {
	BOOK.HOTEL.Variables.photoCarouselCount = $('#photoCarousel ul li').length;
	BOOK.HOTEL.Variables.photoCarouselWidth = $('#photoCarousel ul li').width();
	BOOK.HOTEL.Variables.photoCarouselHeight = $('#photoCarousel ul li').height();

	BOOK.HOTEL.Variables.photoCarouselUlWidth = BOOK.HOTEL.Variables.photoCarouselCount * BOOK.HOTEL.Variables.photoCarouselWidth;

	$('#photoCarousel').css({ width: BOOK.HOTEL.Variables.photoCarouselWidth, height: BOOK.HOTEL.Variables.photoCarouselHeight });

	$('#photoCarousel ul').css({ width: BOOK.HOTEL.Variables.photoCarouselUlWidth, marginLeft: - BOOK.HOTEL.Variables.photoCarouselWidth });

	$('#photoCarousel ul li:last-child').prependTo('#photoCarousel ul');
}; // End of loadphotoCarousel.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.photoCarouselMoveLeft.          //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.photoCarouselMoveLeft = function() {
	$('#photoCarousel ul').animate({
		left: + BOOK.HOTEL.Variables.photoCarouselWidth
	}, 200, function () {
		$('#photoCarousel ul li:last-child').prependTo('#photoCarousel ul');
		$('#photoCarousel ul').css('left', '');
	});
}; // End of photoCarouselMoveLeft.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.photoCarouselMoveRight.         //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.photoCarouselMoveRight = function() {
	$('#photoCarousel ul').animate({
		left: - BOOK.HOTEL.Variables.photoCarouselWidth
	}, 200, function () {
		$('#photoCarousel ul li:first-child').appendTo('#photoCarousel ul');
		$('#photoCarousel ul').css('left', '');
	});
}; // End of photoCarouselMoveRight.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.registerPhotosEvents.           //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.registerPhotosEvents = function(rooms) {

	// Auto Slideshow Checkbox Change Function
	$('#autoSlideshowCheckbox').change(function(){
		if (this.checked)
		{
			BOOK.HOTEL.Variables.autoSlideshowIntervalId = setInterval(function () {
				BOOK.HOTEL.Functions.photoCarouselMoveRight();
			}, 3000);
		}
		else
		{
			if (typeof BOOK.HOTEL.Variables.autoSlideshowIntervalId !== 'undefined') {
				clearInterval(BOOK.HOTEL.Variables.autoSlideshowIntervalId);
			}
		}
	});

	// Button previous Click Function
	$('a.button_prev').on('click', function(){
		BOOK.HOTEL.Functions.photoCarouselMoveLeft();
	});

	// Button Next Click Function
	$('a.button_next').on('click', function(){
		BOOK.HOTEL.Functions.photoCarouselMoveRight();
	});

}; // End of registerPhotosEvents.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadDescription.                //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadDescription = function() {
	var $descriptionArea = $('#description-area-template');
	if ($descriptionArea.length > 0) {
		var descriptionTemplate = _.template($descriptionArea.html());
    	$('#descriptionContainer').html( descriptionTemplate( {hotelDescription: BOOK.HOTEL.Variables.json.hotelDescription} ) );
	}
}; // End of loadDescription.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadFacilities.                 //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadFacilities = function() {
	var $facilitiesArea = $('#facilities-area-template');
	if ($facilitiesArea.length > 0) {
		var facilitiesTemplate = _.template($facilitiesArea.html());
    	$('#facilitiesContainer').html( facilitiesTemplate( {hotelFacilities: BOOK.HOTEL.Variables.json.hotelFacilities} ) );
	}
}; // End of loadFacilities.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadRooms.                      //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadRooms = function() {
	
	if (typeof BOOK.HOTEL.Variables.roomQuantities === 'undefined') {
		BOOK.HOTEL.Functions.LoadRoomQuantities(BOOK.HOTEL.Variables.json.hotelRooms.tableBody);
	}

	var $roomsArea = $('#rooms-area-template');
	
	if ($roomsArea.length > 0) {
	
		var roomsTemplate = _.template($roomsArea.html());
		
		if (BOOK.HOTEL.Variables.isEnableRoomOccupancySorting)
		{
			if (BOOK.HOTEL.Variables.occupancySortDirection === 'ASC')
			{
				//debugger;
				BOOK.HOTEL.Variables.roomSorted = { tableHead: BOOK.HOTEL.Variables.json.hotelRooms.tableHead, tableBody: _.sortBy( BOOK.HOTEL.Variables.json.hotelRooms.tableBody, 'roomOccupancy' ) };
				//$('#filterReviews').removeClass('arrow-down');
			}
			else if (BOOK.HOTEL.Variables.occupancySortDirection === 'DESC')
			{
				BOOK.HOTEL.Variables.roomSorted = { tableHead: BOOK.HOTEL.Variables.json.hotelRooms.tableHead, tableBody: _.sortBy( BOOK.HOTEL.Variables.json.hotelRooms.tableBody, 'roomOccupancy' ).reverse() };
				//$('#filterReviews').addClass('arrow-down');
			}
		}
		else if (BOOK.HOTEL.Variables.isEnableRoomPriceSorting)
		{
			if (BOOK.HOTEL.Variables.priceSortDirection === 'ASC')
			{
				//debugger;
				BOOK.HOTEL.Variables.roomSorted = { tableHead: BOOK.HOTEL.Variables.json.hotelRooms.tableHead, tableBody: _.sortBy( BOOK.HOTEL.Variables.json.hotelRooms.tableBody, 'roomPrice' ) };
				
				//$('#filterReviews').removeClass('arrow-down');
			}
			else if (BOOK.HOTEL.Variables.priceSortDirection === 'DESC')
			{
				BOOK.HOTEL.Variables.roomSorted = { tableHead: BOOK.HOTEL.Variables.json.hotelRooms.tableHead, tableBody: _.sortBy( BOOK.HOTEL.Variables.json.hotelRooms.tableBody, 'roomPrice' ).reverse() };
			}
		}
		else
		{
			BOOK.HOTEL.Variables.roomSorted = BOOK.HOTEL.Variables.json.hotelRooms;
		}
	//debugger;
		$('#roomsContainer').html( roomsTemplate( BOOK.HOTEL.Variables.roomSorted ) );
	
		BOOK.HOTEL.Functions.registerRoomsEvents (BOOK.HOTEL.Variables.json.hotelRooms.tableBody);
		BOOK.HOTEL.Functions.computeGrandTotal(BOOK.HOTEL.Variables.json.hotelRooms.tableBody);
	}
}; // End of loadRooms.



//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.LoadRoomQuantities.             //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.LoadRoomQuantities = function(rooms) {
	BOOK.HOTEL.Variables.roomQuantities = {};
	for (var key in rooms)
	{
		if (rooms.hasOwnProperty(key))
		{
			//alert(key + " -> " + rooms[key]);
			if (rooms[key].hasOwnProperty('roomName'))
			{
				//alert(key + " -> " + rooms[key]);
				var qtyId = rooms[key]['roomName'].split(' ').join('').split('+').join('plus').toLowerCase();
				BOOK.HOTEL.Variables.roomQuantities[qtyId] = 0;
			}
		}
	}
}; // End of LoadRoomQuantities.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.registerRoomsClickEvents.       //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.registerRoomsEvents = function(rooms) {
	// Occupancy Click Function
	$('.sort_occupancy').on('click', function(){

		BOOK.HOTEL.Variables.isEnableRoomPriceSorting = false;

		if(!BOOK.HOTEL.Variables.isEnableRoomOccupancySorting)
		{
			BOOK.HOTEL.Variables.isEnableRoomOccupancySorting = true;
			BOOK.HOTEL.Variables.occupancySortDirection = 'DESC';
		}

		if (BOOK.HOTEL.Variables.occupancySortDirection === 'ASC')
		{
			BOOK.HOTEL.Variables.occupancySortDirection = 'DESC';
		}
		else if (BOOK.HOTEL.Variables.occupancySortDirection === 'DESC')
		{
			BOOK.HOTEL.Variables.occupancySortDirection = 'ASC';
		}

		BOOK.HOTEL.Functions.loadRooms();
	});
	
	// Price per Room Click Function
	$('.sort_price').on('click', function(){
		BOOK.HOTEL.Variables.isEnableRoomOccupancySorting = false;
		
		if(!BOOK.HOTEL.Variables.isEnableRoomPriceSorting)
		{
			BOOK.HOTEL.Variables.isEnableRoomPriceSorting = true;
			BOOK.HOTEL.Variables.priceSortDirection = 'DESC';
		}

		if (BOOK.HOTEL.Variables.priceSortDirection === 'ASC')
		{
			BOOK.HOTEL.Variables.priceSortDirection = 'DESC';
		}
		else if (BOOK.HOTEL.Variables.priceSortDirection === 'DESC')
		{
			BOOK.HOTEL.Variables.priceSortDirection = 'ASC';
		}

		BOOK.HOTEL.Functions.loadRooms();
	});

	// No. Rooms change Function
	$('.room_quantity select').change(function () {
		BOOK.HOTEL.Variables.roomQuantities[this.name] = parseInt( $.trim( this.value ) );
		BOOK.HOTEL.Functions.computeGrandTotal(rooms);
	});
}; // End of registerRoomsClickEvents.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.computeGrandTotal.              //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.computeGrandTotal = function(rooms) {
	BOOK.HOTEL.Variables.total = 0; 
	for (var key in rooms)
	{
		if (rooms.hasOwnProperty(key))
		{
			//alert(key + " -> " + rooms[key]);
			if (rooms[key].hasOwnProperty('roomName') && rooms[key].hasOwnProperty('roomPrice'))
			{
				//alert(key + " -> " + rooms[key]);
				var qtyId = rooms[key]['roomName'].split(' ').join('').split('+').join('plus').toLowerCase();
				BOOK.HOTEL.Variables.total = BOOK.HOTEL.Variables.total + ( BOOK.HOTEL.Variables.roomQuantities[qtyId] * rooms[key]['roomPrice'] ) ;
			}
		}
	}
	$('#grandTotal').html ( BOOK.HOTEL.Constants.CURRENCY_SYMBOL+''+ Math.round(BOOK.HOTEL.Variables.total * 100) / 100);
}; // End of computeGrandTotal.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadReviews.                    //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadReviews = function() {
	$('#reviewsContainer').html( '' );
	var $reviewsArea = $('#reviews-area-template');
	
	if ($reviewsArea.length > 0) {
	
		var reviewsTemplate = _.template($reviewsArea.html());
	
		if (BOOK.HOTEL.Variables.isEnableReviewsSorting)
		{
			if (BOOK.HOTEL.Variables.reviewsSortDirection === 'ASC')
			{
				//debugger;
				BOOK.HOTEL.Variables.reviewsSortedBlocks = _.sortBy( BOOK.HOTEL.Variables.json.hotelReviews, 'reviewScore' );
				//$('#filterReviews').removeClass('arrow-down');
			}
			else if (BOOK.HOTEL.Variables.reviewsSortDirection === 'DESC')
			{
				BOOK.HOTEL.Variables.reviewsSortedBlocks = _.sortBy( BOOK.HOTEL.Variables.json.hotelReviews, 'reviewScore' ).reverse();
				//$('#filterReviews').addClass('arrow-down');
			}
		}
		else
		{
			BOOK.HOTEL.Variables.reviewsSortedBlocks = BOOK.HOTEL.Variables.json.hotelReviews;
		}
		
		if (typeof BOOK.HOTEL.Variables.reviewsTotalBlocks === 'undefined') {
			BOOK.HOTEL.Variables.reviewsTotalBlocks = BOOK.HOTEL.Variables.reviewsSortedBlocks.length;
		}
	
		if (typeof BOOK.HOTEL.Variables.reviewsNumberOfPages === 'undefined') {
			BOOK.HOTEL.Variables.reviewsNumberOfPages = Math.ceil( BOOK.HOTEL.Variables.reviewsTotalBlocks / BOOK.HOTEL.Variables.reviewsPerPageBlocks );
		}
		
		BOOK.HOTEL.Variables.BlocksFrom = ( BOOK.HOTEL.Variables.reviewsCurrentPage * BOOK.HOTEL.Variables.reviewsPerPageBlocks ) - BOOK.HOTEL.Variables.reviewsPerPageBlocks + 1;
	
		BOOK.HOTEL.Variables.BlocksTo = ( BOOK.HOTEL.Variables.BlocksFrom - 1 ) + BOOK.HOTEL.Variables.reviewsPerPageBlocks;
	
		BOOK.HOTEL.Variables.hotelReviews = [];
		//debugger;
		for ( var i = BOOK.HOTEL.Variables.BlocksFrom; i <= BOOK.HOTEL.Variables.BlocksTo; i++ )
		{
			if ( BOOK.HOTEL.Variables.reviewsSortedBlocks.hasOwnProperty(i) )
			{
				BOOK.HOTEL.Variables.hotelReviews.push( BOOK.HOTEL.Variables.reviewsSortedBlocks[i] );
			}
		}
	
		//BOOK.HOTEL.Variables.eitherSide = BOOK.HOTEL.Variables.reviewsShowEachSide * BOOK.HOTEL.Variables.reviewsPerPageBlocks;
	
		$('#reviewsContainer').html( reviewsTemplate( {hotelReviews: BOOK.HOTEL.Variables.hotelReviews, pagination: BOOK.HOTEL.Variables.reviewsNumberOfPages} ) );
		
		BOOK.HOTEL.Functions.registerReviewsEvents();
	}
}; // End of loadReviews.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.registerReviewsClickEvents.     //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.registerReviewsEvents = function() {
	
	// Sort Reviews Click Function
	$('#filterReviews').on('click', function(){
		BOOK.HOTEL.Variables.reviewsCurrentPage = 1;
		//$('#filterDefault').removeClass('active-filter');
		//$('#filterReviews').addClass('active-filter');
		if(!BOOK.HOTEL.Variables.isEnableReviewsSorting)
		{
			BOOK.HOTEL.Variables.isEnableReviewsSorting = true;
			BOOK.HOTEL.Variables.reviewsSortDirection = 'DESC';
		}

		if (BOOK.HOTEL.Variables.reviewsSortDirection === 'ASC')
		{
			//debugger;
			BOOK.HOTEL.Variables.reviewsSortDirection = 'DESC';
		}
		else if (BOOK.HOTEL.Variables.reviewsSortDirection === 'DESC')
		{
			BOOK.HOTEL.Variables.reviewsSortDirection = 'ASC';
		}
		//$('#filterReviews').toggleClass('arrow-down');
		BOOK.HOTEL.Functions.loadReviews();
	});
	
	// Sort Default Click Function
	$('#filterDefault').on('click', function(){
		BOOK.HOTEL.Variables.reviewsCurrentPage = 1;
		//$('#filterReviews').removeClass('active-filter');
		//$('#filterDefault').addClass('active-filter');
		BOOK.HOTEL.Variables.isEnableReviewsSorting = false;
		BOOK.HOTEL.Functions.loadReviews();
	});
	
	// Pagination Click Function
	$('.pagination li').on('click', function(){
		BOOK.HOTEL.Variables.reviewsCurrentPage = parseInt( $.trim(this.title) );
		BOOK.HOTEL.Functions.loadReviews();
	});
}; // End of registerReviewsClickEvents.

//////////////////////////////////////////////////////////////////////
//function: BOOK.HOTEL.Functions.loadFooter.                     //
//////////////////////////////////////////////////////////////////////
BOOK.HOTEL.Functions.loadFooter = function() {
	$('#footerContainer').html( BOOK.HOTEL.Variables.json.hotelFooterNote );
}; // End of loadFooter.