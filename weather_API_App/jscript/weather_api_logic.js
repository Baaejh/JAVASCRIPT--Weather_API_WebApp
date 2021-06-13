
// WEATHER API WEB APP - Created by: Bailey Hutchings
	// This Program Connects to openweatherdata.org's API services and returns 
	// current weather and forecast data. An additional API call is then made to the
	// Google Maps API containing the coordinates returned from the API calls	
	// API response data is then styled and displayed for the user.


// Global Variable Storage (used to avoid storing variables globally)
var globalVariableStorage = function() {
	//SlideShow Related Variables
	let weatherSlideIndex = 1;
	let weatherSlideShowTimer;
	let forecastSlideIndex = 1;
	let forecastSlideShowTimer;
	let pageLoadSlideBoolean = true;
	let forecastLoadBoolean = true;

	// Global API Response Data (population & Dates)
	let populationGlobal = {};
	let coordinatesForMapsAPI = {};
	let forecastDatesGlobal = [];
	let forecastDaysGlobal = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
		'Thursday', 'Friday', 'Saturday'] 
	let forecastDaysCount

	return { //Returning Variables
		weatherSlideIndex: weatherSlideIndex,
		weatherSlideShowTimer: weatherSlideShowTimer,
		forecastSlideIndex: forecastSlideIndex,
		forecastSlideShowTimer: forecastSlideShowTimer,
		pageLoadSlideBoolean: pageLoadSlideBoolean,
		forecastLoadBoolean: forecastLoadBoolean,
		populationGlobal: populationGlobal,
		forecastDatesGlobal: forecastDatesGlobal,
		coordinatesForMapsAPI: coordinatesForMapsAPI,
		forecastDaysGlobal: forecastDaysGlobal,
	};
}();


// Main Script Logic/execution Starts here [Function Automatically runs on startup] !
(function APIRequest() {
	// * VARIABLES *			
	// The following variables are declared globally within APIRequest()
	// But many are assigned within 'createRequests()'

	// Assigning/Declaring the[API search] DOM elements to variables
	let requestButton = document.querySelector("#weather_API_request_button");
	let userInputCity = document.querySelector("#city_input");
	let userInputUnits;

	// Declaring an Object{} - Used as a template for the API calls.	
	let requestsObject;

	// Booleans used within ifRequestsPass() to handle sucsesfull / Failed API Requests.
    let weatherRequestPass;
	let forecastRequestPass;

	// Objects used to store formatted/parsed API's Responses
	let weatherDataResponse;
	let forecastDataResponse;
	// * END OF VARIBLES *

	//Time Out PROMISE for sending the API Requests with slight delay (used within sendAPIRequests())
	const requestSendTimeOut = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

	// FUNCTION creates a new XMLHttpRequest when called
	function GenerateXmlHttpRequest() {
		return new XMLHttpRequest();
	};

	//FUNCTION creates the requests and event listeners for the API Requests
	function createRequests() {
		try {
			// Calls GenerateXmlHttpRequest() and assigns a new XMLHttpRequest to the variable
			let weatherRequest = GenerateXmlHttpRequest();
			let forecastRequest = GenerateXmlHttpRequest();

				// * Resetting / assigning APIRequest()'s global VARIABLES  *
			//assigns the radio button checked at the the request is submitted
			userInputUnits = document.querySelector('input[name="units"]:checked');		

			// resets the succesfull API request Booleans
			weatherRequestPass = false;
			forecastRequestPass = false;

			// resets array so it is clean for the API's Response
			weatherDataResponse = {};
			forecastDataResponse = {};

			// used to loop thru the API Requests
			requestsObject = {'weather': weatherRequest, 'forecast': forecastRequest};

				// * GLOBAL VARIABLES *		
			// resets arrays so it is clean for the API's Response
			globalVariableStorage.coordinatesForMapsAPI = {};
			globalVariableStorage.populationGlobal = {};

				// * HANDLING API REQUESTS * 
			// API Current Weather Request OPEN
			weatherRequest.open(
				'GET', 
				`http://api.openweathermap.org/data/2.5/weather?q=${userInputCity.value}
				&units=${userInputUnits.value}&appid=008d3a7ae57afc77bde326fbe000bd08`
			);
			// API Forecast Request OPEN
			forecastRequest.open(
				'GET', 
				`http://api.openweathermap.org/data/2.5/forecast?q=${userInputCity.value}
				&units=${userInputUnits.value}&appid=008d3a7ae57afc77bde326fbe000bd08`
			);

			// Creates an Listener event that triggers when each API Call Loads
			for (let key of Object.keys(requestsObject)) {
				//Loops thru the requestsObject{} template
				if (key == 'weather'){
					weatherRequest.onload = () => {
						if (weatherRequest.readyState === XMLHttpRequest.DONE) {	
							if (weatherRequest.status === 200) {
								console.log("weatherRequest API = " + weatherRequest.status, 
									weatherRequest.statusText);

								// Assigning API Response Data to Variable
								weatherDataResponse = JSON.parse(weatherRequest.response);

								// Setting Global Variable 'coordinatesForMapsAPI' if it exists
								// as it is required by --> initialiseGoogleMaps()
								if (Object.entries(weatherDataResponse.coord).length > 0) {
									globalVariableStorage.coordinatesForMapsAPI = weatherDataResponse.coord;
									// Success
									handle_API_responses('weather');
								} else {
									// Fail
									handle_API_responses('error', 'forecast', forecastRequest);
								}
							} else {
								// Fail
								handle_API_responses('error', 'weather', weatherRequest);
							}
						}
					}
					weatherRequest.onerror = () => {   // on ERROR
						// Fail
						handle_API_responses('error', 'weather', weatherRequest);
					}
					weatherRequest.onloadend = () => { // on LoadEnd
						// Resets/clears Request
						weatherRequest.abort();
						weatherRequest = null;
					}
				}

				if (key == 'forecast'){
					forecastRequest.onload = () => {	  // Request.onload
						if (forecastRequest.readyState === XMLHttpRequest.DONE) {
							if (forecastRequest.status === 200) {

								console.log("forecastRequest API = " + forecastRequest.status, 
									forecastRequest.statusText);

								// Assigning API Response to Global API Data Variable
								forecastDataResponse = JSON.parse(forecastRequest.response);

								// Setting Global Variable 'populationGlobal' if it exists
								// as it is required by --> manageWeatherData()
								if (Object.entries(forecastDataResponse.city).length > 0){
									globalVariableStorage.populationGlobal = forecastDataResponse.city;
									// Success
									handle_API_responses('forecast');
								}else {
									// Fail
									handle_API_responses('error', 'forecast', forecastRequest);
								}
							} else {
								// Fail
								handle_API_responses('error', 'forecast', forecastRequest);
							}
						}	
					}
					forecastRequest.onerror = () => {   // on ERROR
						// Fail
						handle_API_responses('error', 'forecast', forecastRequest);
					}
					forecastRequest.onloadend = () => { // on LoadEnd
						// Resets/clears Request
						forecastRequest.abort();
						forecastRequest = null;
					}
				}
			}

		} catch (APICreateError) { // Raise Exceptions
			console.log('Exception Raised creating API Requests ...');
			console.log(APICreateError);

			// Calling function to display visual feedback
			handleVisualFeedback('exception');
		}
	};

	// FUNCTION to send and Delay the API'S XMLHttpRequests
	async function sendAPIRequests() {
		try{
			for (let [name, APIRequest] of Object.entries(requestsObject)) {
				APIRequest.send();
				await requestSendTimeOut(1000);
			}
		} catch (APISendError) { // Raise Exceptions
			console.log('Exception Raised while sending API Requests ...');
			console.log(APISendError);

			// Calling function to display visual feedback
			handleVisualFeedback('exception');
		}
	};

	// FUNCTION manages the API Requests after they are sent, 
	// program execution will only continue if both requests are Succesfull,
	// if not an error message prompts the user to try again.
	function handle_API_responses(requestMessage, requestName, request) {
		switch(requestMessage){

			case 'weather':
				weatherRequestPass = true;
				break;

			case 'forecast':
				forecastRequestPass = true;
				break;

			case 'error':
				console.log("*** API REQUEST ERROR  ***");
				console.log(`status and response for the ${requestName} API Request ...`);
				console.log(request.status);
				console.log(request.response);

				// Calls function to display on screen feedback
				handleVisualFeedback('fail');
				break;
		}

		// IF both API Requests are Sucessful navigate to next section of program
		if (weatherRequestPass == true && forecastRequestPass == true){
			console.log("Both API Requests Succesfull !");
			// Changing button text feedback (back to normal)
			handleVisualFeedback('pass');

			//Calling functions to manage/handle the sucesfull API Response data
			manageWeatherData(weatherDataResponse);
			manageForecastData(forecastDataResponse);
		}
	};

	// FUNCTION displays/updates on screen feedback/messages when a request fails/passes
	function handleVisualFeedback(outcome) {
		
		if (outcome === 'pass'){ //Success
			requestButton.innerHTML = "Submit";
		} 
		else if (outcome === 'fail') { //Error
			userInputCity.value = "Error Fetching Weather Data ... TRY AGAIN";
			requestButton.innerHTML = "TRY AGAIN";
		} 
		else if (outcome === 'exception') { //Exception
			userInputCity.value = "Exception Thrown ... Please Try Again...";
			requestButton.innerHTML = "TRY AGAIN";
			alert("Exception Raised creating the API requests, " +
			"Page may not display as intended ... See Console for details");
		} 
	};


	// EVENT LISTENER for the 'Search City' --> "SUBMIT" Button.
	// Runs functions that call upon XMLHttpRequest to query the API and if succesfull it-
	// passes the formatted API Response object to either manageWeatherData() OR manageForecastData() 
	// to sort and display the content.

	requestButton.addEventListener("click", () => {
		createRequests();
		// Sending API Requests
		sendAPIRequests();
	});

})();	// ** END OF APIRequest() **

	
// Handles and distributes the API Resposne data (Weather Data)
function manageWeatherData(weatherDataObject) {
	// Try Catch used to find errors within this function and the other functions called within	
	try {
			// ** VARIABLES **
		let weatherAPIData = weatherDataObject;

		console.log("Weather Data ...");
		console.log(weatherAPIData);

		// filling Slides with values from the arrays created from API Response Data:
		//1st SLIDE
		for(let [APIkey, APIvalue] of Object.entries(weatherAPIData.sys)) {
			if (APIkey	== "country"){
				document.querySelector("#weather_slide_1").innerHTML = weatherAPIData.name.substring(0, 20); // COUNTRY
				document.querySelector("#weather_slide_title_1").innerHTML = 
				APIkey.toString() + ": " + APIvalue.toString();
			}
		}
		
		// 2nd SLIDE
		document.querySelector("#weather_slide_2").innerHTML = weatherAPIData.weather[0].main; // CONDITIONS
		document.querySelector("#weather_slide_title_2").innerHTML = "Conditions";

		// 3rd SLIDE
		document.querySelector("#weather_slide_3").innerHTML = globalVariableStorage.populationGlobal.population; //POPULATION
		document.querySelector("#weather_slide_title_3").innerHTML = "Population";

		// 4th & 5th SLIDE
		for(let [key, value] of Object.entries(weatherAPIData.main)) {
			filtered_key = key.toString().replace('_', ' ');
			if (key	== "temp"){
				document.querySelector("#weather_slide_4").innerHTML = value.toString() + "°";  // TEMP SLIDE
				document.querySelector("#weather_slide_title_4").innerHTML = filtered_key;
			} else if (key == "temp_max"){
				document.querySelector("#weather_slide_5").innerHTML = value.toString() + "°";	// MAX_TEMP SLIDE
				document.querySelector("#weather_slide_title_5").innerHTML = filtered_key; 
			} 
		}

		// Resetting Weather SlideShow Index & calling the slideshow function
		weatherDataSlides('show', 1);

		// Handles the Google Maps API (param = passing the coords of the users desired location)
		initialiseGoogleMaps(globalVariableStorage.coordinatesForMapsAPI);

	} catch (weatherDataError){
		// creates an alert if an exception is raised, also console logs the error.
		console.log('Exception Raised managing and displaying current weather API data ...');
		console.log(weatherDataError);
		clearInterval(globalVariableStorage.weatherSlideShowTimer)
		alert("Exception Raised while displaying the Current Weather Data, " +
			"Page may not display as intended ... See Console for details");
	}
}; // ** END OF manageWeatherData() **


// Handles and distributes the API Resposne data (Forecast Data)
function manageForecastData(forecast_data_object) {
	try {
			// ** VARIABLES **
		// Assigning API response to variable
		const forecastAPIData = forecast_data_object;
		// Stores the forecast info for each day (Total = 5)
		const forecastData = [];

		console.log("forecast Data ...");
		console.log(forecastAPIData);
		
		// assigning variables to the DOM elemnents within the forecast tables
		let info_left_1 = document.querySelectorAll(".info_left_1");
		let info_right_1 = document.querySelectorAll(".info_right_1");

		let info_left_2 = document.querySelectorAll(".info_left_2");
		let info_right_2 = document.querySelectorAll(".info_right_2");

		let info_left_3 = document.querySelectorAll(".info_left_3");
		let info_right_3 = document.querySelectorAll(".info_right_3");

		let info_left_4 = document.querySelectorAll(".info_left_4");
		let info_right_4 = document.querySelectorAll(".info_right_4");

		let info_left_5 = document.querySelectorAll(".info_left_5");
		let info_right_5 = document.querySelectorAll(".info_right_5");

		// Creating Array with table data
		let infoTablesLeft = [info_left_1, info_left_2, info_left_3, info_left_4, info_left_5];
		let infoTablesRight = [info_right_1, info_right_2, info_right_3, info_right_4, info_right_5];

		// filling the forecastData Array, aswell as the: forecastDatesGlobal (Global Variable)
		if (forecastAPIData.list){
			for (let [APIKey1, APIValue1] of Object.entries(forecastAPIData.list)) {
				for (let [APIKey2, APIValue2] of Object.entries(APIValue1)) {
					if (APIKey2 == 'dt_txt') {
						let timeSlice = APIValue2.toString().slice(11);
						if (timeSlice == "00:00:00"){
							forecastData.push(APIValue1.main);
							globalVariableStorage.forecastDatesGlobal.push(APIValue2.toString().slice(0, 10));
						}
					}
				}
			}
		} else {
			throw TypeError('API Response Data Invalid ');
		}

		// Filling the DOM Elements with the Forecast API Data
		for (let i = 0; i < forecastData.length; i++){
			for (let [forecastKey, forecastValue] of Object.entries(forecastData[i])) {

				filtered_key = forecastKey.toString().replace('_', ' '); // removing '_' from key names

				if (forecastKey	== 'temp'){
					infoTablesLeft[i][0].innerHTML = filtered_key;
					infoTablesRight[i][0].innerHTML = forecastValue;
				} 
				else if (forecastKey == 'temp_max') {
					infoTablesLeft[i][1].innerHTML = filtered_key;
					infoTablesRight[i][1].innerHTML = forecastValue;
				} 
				else if (forecastKey == 'temp_min') {
					infoTablesLeft[i][2].innerHTML = filtered_key;
					infoTablesRight[i][2].innerHTML = forecastValue;
				} 
				else if (forecastKey == 'humidity') {
					infoTablesLeft[i][3].innerHTML = filtered_key;
					infoTablesRight[i][3].innerHTML = forecastValue;
				} 
				else if (forecastKey == 'pressure') {
					infoTablesLeft[i][4].innerHTML = filtered_key;
					infoTablesRight[i][4].innerHTML = forecastValue;
				}	
			}
		}

		// calls FORECAST Data Slideshow function to begin displaying slides
		forecastDataSlides('show', 1);

	} catch (forecastDataError){ // In case of error
		// creates an alert if an exception is raised, also console logs the error.
		console.log('Exception Raised managing and displaying forecast API data ...');
		console.log(forecastDataError);

		clearInterval(globalVariableStorage.forecastSlideShowTimer); // Clears/stops Slideshow timer

		alert("Exception Raised managing and displaying forecast API data, " +
			"Page may not display as intended ... See Console for details");
	}

}; // ** END OF manageForecastData()**

	

// SlideShow Functions for the current weather data
function weatherDataSlides(input, n) {
		// * VARIABLES *
	//Assigning DOM elements to variables
	let top_right_panel = document.querySelector("#weather_API_top_right_panel");
	let bottom_left_panel = document.querySelector("#weather_API_bottom_left_panel");

	let slides = document.querySelectorAll(".weather_slides");
	let dot_Container = document.querySelector("#weather_slideshow_dot_container");
	let dots = document.querySelectorAll(".weather_slideshow_dot");
	let weather_data = document.querySelectorAll(".animation_target_primary");
	let weather_data_title = document.querySelectorAll(".animation_target_secondary");
	let prev = document.querySelectorAll(".weather_arrow_prev");
	let next = document.querySelectorAll(".weather_arrow_next");
	
	// Manages the vaslues passed into the function, determining the required action.
	switch(input){
		case 'dot':
			currentSlide(n);
			break;

		case 'show':
			currentSlide(n);
			prev[0].onclick = () => { plusSlides(-1) }; // listener for arrow buttons navigate -1 Slides
			next[0].onclick = () => { plusSlides(1) };	// listener for arrow buttons navigate +1 Slides
			break;
	}

	// Displays the next slide in the list.
	function plusSlides(n) {
		showWeatherSlides(globalVariableStorage.weatherSlideIndex += n);
	};
	// Displays the slide at value (n).
	function currentSlide(n) {
		showWeatherSlides(globalVariableStorage.weatherSlideIndex = n);
	};

	// Manages the automation of the slideshow. using setIntervals()
	function weatherSlideshowTimer() {
		if (globalVariableStorage.pageLoadSlideBoolean == true ) {
			globalVariableStorage.weatherSlideShowTimer = setInterval(() => { 
				plusSlides(1);
			}, 6000);

			globalVariableStorage.pageLoadSlideBoolean = false;

		}else {
			clearInterval(globalVariableStorage.weatherSlideShowTimer);
			globalVariableStorage.weatherSlideShowTimer = setInterval(() => {
				plusSlides(1);
			}, 6000);
		}
	};

	// Handles the animations / transitions when a slide progresses.
	function weatherSlideshowAnimation(slide, title) {
		slide.animate(
			[
				{transform: 'translateX(40%)', opacity: '0.1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{fontsize: '3em', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(-40%)', opacity: '0.1'},
			], { duration: 6000 });

		title.animate(
			[
				{opacity: '0.1', visibility: 'visible'},
				{opacity: '1'},
				{opacity: '1'},
				{opacity: '1'},
				{opacity: '0.1', visibility: 'hidden'},
			], { duration: 6000 });	
	};

	// Handles displaying the slides each time a new slide is requested.
	function showWeatherSlides(slideRequest) {
		//Displays slide content
		prev[0].style.visibility = "visible";
		next[0].style.visibility = "visible";
		dot_Container.style.visibility = "visible";

		// Makes On Screen Panels Visible (Top Right & Bottom Left Panels)
		top_right_panel.className = top_right_panel.className.replace("d-none", "");
		bottom_left_panel.className = bottom_left_panel.className.replace("d-none", "");

		// code to handle if slide is too low / High
		if (slideRequest > slides.length) {globalVariableStorage.weatherSlideIndex = 1}
		if (slideRequest < 1) {globalVariableStorage.weatherSlideIndex = slides.length}

		// Sets ALL Slides display to none when showSlides() is called
		for (i = 0; i < slides.length; i++) {	
			slides[i].style.display = "none";
		}

		// Sets ALL dots display to none when showSlides() is called
		for (i = 0; i < dots.length; i++) {
			dots[i].style.visibility = "visible";
		 	dots[i].className = dots[i].className.replace(" active-dot", "");
		}

		// Displays the dot and slide at what ever location/index weatherSlideIndex is set at
		slides[globalVariableStorage.weatherSlideIndex-1].style.display = "block";
		dots[globalVariableStorage.weatherSlideIndex-1].className += " active-dot";

		// Calling Slideshow transition / Animation Logic
		weatherSlideshowAnimation(weather_data[globalVariableStorage.weatherSlideIndex-1], 
			weather_data_title[globalVariableStorage.weatherSlideIndex-1]);
		
		//Calling Slideshow Automation / Timer
		weatherSlideshowTimer();
	};
}; // -------- END OF weatherDataSlides() ---------


// SlideShow Functions for the current forecast data
function forecastDataSlides(slideShowRequest, Index) {
	// Assigning DOM Elements to Variables
	let forecast_panel = document.querySelector("#weather_API_bottom_right_panel"); // activates on page load
	let forecast_container = document.querySelectorAll(".forecast_container");

	// Forecast Date Heading
	let forecast_date_title = document.querySelectorAll(".forecast_heading_top");

	let prev = document.querySelectorAll(".forecast_arrow_prev");
	let next = document.querySelectorAll(".forecast_arrow_next");

	//Displays Bottom Right (Forecast) Panel
	forecast_panel.className = forecast_panel.className.replace("d-none", "");

	// Array to contain the Days of the week that each of the 5 forecasted days land on
	let forecastDaysArray = [];

	// Filling forecast_days_array ARRAY with the Dates and Days from arrays:
	// globalVariableStorage.forecastDatesGlobal &  globalVariableStorageforecastDaysGlobal
	for (let i = 0; i < globalVariableStorage.forecastDatesGlobal.length; i++) {
		let date = new Date(globalVariableStorage.forecastDatesGlobal[i]).getDay();
		forecastDaysArray[i] = globalVariableStorage.forecastDaysGlobal[date];
	}

	//Runs when Slides are first called from manageForecastData().
	switch(slideShowRequest){
		case 'show':
			currentSlide(Index);
			prev[0].onclick = () => { plusSlides(-1) };
			next[0].onclick = () => { plusSlides(1) };
			break;
	}

	// Displays Next Slide
	function plusSlides(Index) {
		showForcastSlides(globalVariableStorage.forecastSlideIndex += Index);
	};
	// Display current slide
	function currentSlide(Index) {
		showForcastSlides(globalVariableStorage.forecastSlideIndex = Index);
	};

	// Handles the slideshow Timer
	function forecastSlideshowTimer() {
		if (globalVariableStorage.forecastLoadBoolean == true ) {
			globalVariableStorage.forecastSlideShowTimer = setInterval(() => { 
				plusSlides(1);
			}, 8000);
			
			globalVariableStorage.forecastLoadBoolean = false;

		}else {
			clearInterval(globalVariableStorage.forecastSlideShowTimer);
			globalVariableStorage.forecastSlideShowTimer = setInterval(() => {
				plusSlides(1);
			}, 8000);
		}
	};

	function forecastSlideshowAnimation(forecast_date) {

		forecast_date.animate(
			[
				{transform: 'translateX(20%)', opacity: '0.1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(0%)', opacity: '1'},
				{transform: 'translateX(-20%)', opacity: '0.1'},
			], { duration: 8000 }
		);	
	 };

	// Handles displaying the slides each time a new slide is requested
	function showForcastSlides(requestedSlide) {

		// code to handle if slide index is too low / High
		if (requestedSlide > forecast_container.length) {globalVariableStorage.forecastSlideIndex = 1};
		if (requestedSlide < 1) {globalVariableStorage.forecastSlideIndex = forecast_container.length};

		// Sets ALL SLIDES and TITLES display set to none when showForcastSlides() is called
		for (i = 0; i < forecast_container.length; i++) {forecast_container[i].style.display = "none"};
		forecast_date_title[0].style.display = "none";

		// ASSIGNING selected slides Date and Day to variables
		forecastDateData = globalVariableStorage.forecastDatesGlobal[globalVariableStorage.forecastSlideIndex-1];
		forecastDayDisplay = forecastDaysArray[globalVariableStorage.forecastSlideIndex-1];

		// Displaying the Slide TITLE (Date & Day)
		forecast_date_title[0].innerHTML = `Forecast: ${forecastDayDisplay} (${forecastDateData})`;

		// Handling the visibility of the Slideshow content (TEMP, HUMIDITY, ECT)
		forecast_container[globalVariableStorage.forecastSlideIndex-1].style.display = "block";
		forecast_date_title[0].style.display = "block";

		// passing the slideshow heading and content to be animated
		forecastSlideshowAnimation(forecast_date_title[0]);

		// Calling the SlideShow Timing Logic
		forecastSlideshowTimer();
	};

}; // -------- END OF weatherDataSlides() ---------


//Google Maps API code
function initialiseGoogleMaps(coordinateData) {
	try {
		// Assigning Coordinate Data Objects to variables
		let coordinates = coordinateData;
		let defaultCoordinates = {lat: 1, lng: 1};

		if(Object.entries(coordinates).length > 0){ // MAKE SURE COORDINATES CONTAINS INFO
			map = new google.maps.Map(document.querySelector("#map_container"), {
				center: { lat: coordinates.lat, lng: coordinates.lon },
				zoom: 9,
				mapTypeId: 'hybrid'
			});
		} else { // if there is no coordinate data from the API request -> Display a default location
			map = new google.maps.Map(document.querySelectorAll("#map_container"), {
				center: defaultCoordinates,
				zoom: 9,
				mapTypeId: 'hybrid'
			});

			alert("Unable to locate coordinates for Map ... Default Location Displayed");
		}
	} catch(googleMapsError) {
		// creates an alert if an exception is raised, also console logs the error.
		console.log("Google Maps Exception: ");
		console.log(googleMapsError);
		alert("Exception Raised while displaying the Google Maps API, " +
			"Page may not display as intended ... See Console for details");
	}

}; // -------- END OF initialiseGoogleMaps() ---------
