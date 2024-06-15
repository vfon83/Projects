document.getElementById("scraping-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
  
    var websiteLink = document.getElementById("website-link").value;
    var iframe = document.getElementById("result-frame");
    var headButton = document.getElementById("headButton");
    var dataButton = document.getElementById("dataButton");
    var smiley = document.querySelector(".smiley"); // Use querySelector to get the first element with class "smiley"
    var xhttp= new XMLHttpRequest();

    function hideElements() {
        iframe.style.display = 'none';
        headButton.style.display = 'none';
        dataButton.style.display = 'none';
        smiley.style.display = 'none';
        smiley.style.animationPlayState = 'paused';
    }

    function showElements() {
        iframe.style.display = 'block';
        headButton.style.display = 'block';
        dataButton.style.display = 'block';
        smiley.style.display = 'none';
        smiley.style.animationPlayState = 'paused';
    }

    // Show or hide iframe based on whether website link is empty or not
    if (websiteLink !== "") {
        try {
            var url = new URL(websiteLink);
            url.searchParams.set('limit', 'all');
            console.log("Modified URL:", url.href);
            iframe.src = url.href;
            hideElements();
            iframe.style.display = 'none';
            smiley.style.display = 'block';


            iframe.addEventListener('load', function() {
                showElements(); 
            });
        } catch (error) {
            console.error("Invalid URL:", error);
            hideElements();
        }
    } else {
        hideElements();
    }
});
