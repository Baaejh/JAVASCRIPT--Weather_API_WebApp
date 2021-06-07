# JavaScript Weather API Web Application

* Project Name:  Current Weather & Forecast API Web Application *
* Created By: Bailey Hutchings *

<b| Description: | </b>

- This Web application is created with vanilla javascript, 
ensuring that no abstracted or predefined code is used from external librarys / frameworks. 
This Web app also contains: HTML5/CSS3 and Bootstrap v4.6.0 for styling / responsiveness.

- Additionally, This Web Application enables a user to recieve Basic weather and forecast information for a desred city, 
couretesy of: openweathermap.org's API services. As well as google maps location info (Google Maps API).

- This Web app Contains a basic Text input field, that allows the user to enter the desired city
or location name, with additional radio buttons used to select the desired temperature scale: 
(Celcius / fahrenheit). Weather information is then submitted with a large red 'Submit button'
which will trigger the javascript to process the requested information.

- The information that is recieved from the API querys are displayed in a tiled format, displaying
a total of 4 Tiles, (Note: Bottom tiles are connected when browser width > 992px)

- the following explains the content of each display tile within the Webapp:
		- Top Left: Weather Search information.
		- Top right: Current weather information (SlideShow)
		- Bottom Left: Google Maps Display (Displays view of desired location)
		- Bottom Right: 5 day Forecast Information.
    
    
<b>| Background Information: | </b> 
- OpenWeatherMaps is a free service, that provides global weather data for any geographical location. 
The weather data is accessable via an API service.

- Google Maps API is Another Free Service That allows Javascript to query the Google Maps API
service with a range of information, in order to recieve a response containing Google Maps
related information, that can be displayed via a DIV in a webpage.


<b>| Software Requirements: | </b>

- Any Modern Browser with javascript capabilities should support this webpage.
With that being said, chrome was the primary browser used for the development/testing
of this application.

	Note: This application does not work Using the No longer supported Internet Explorer,
		  as this project uses JavaScript promises, which are not supported by This browser.
		  The Web application does properly function on edge, it's replacement.


<b>| Important Info: | </b>

This Application Works best with Google Chrome.

    API Keys:
	  The OpenWeatherMaps and Google Maps API's both require an API Key to access the services.
	  This version of the weather API forecast App is intended for Demonstration or
	  private/personal use, and Contains personal API Keys. 
	  a Production ready Version/Build would require a commercial API Key.


<b>| Future Updates / Patches: | </b>
- Functional Rain Radar Layering for the Google Maps API Display.
- Further Improvements and Support for other Browsers and Mobile Devices.
- More detailed Weather and forecast information and features.
