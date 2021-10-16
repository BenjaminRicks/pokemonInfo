document.getElementById("pokemonSubmit").addEventListener("click", function(event) {
  event.preventDefault();
  value = document.getElementById("pokemonInput").value;
  if (value === "") {
    value = Math.floor(Math.random() * 898) + 1;
  }
  if(typeof value === 'string') {
    value = value.toLowerCase();
  }
  const isStandardMethod = document.getElementById("standardMethod").checked;
  const url = "https://pokeapi.co/api/v2/pokemon/" + value;
  const typeMap = new Map([
    ["normal", "normalType.jpg"],
    ["fire", "fireType.jpg"],
    ["water", "waterType.jpg"],
    ["electric", "electricType.jpg"],
    ["grass", "grassType.png"],
    ["ice", "iceType.jpg"],
    ["fighting", "fightingType.jpg"],
    ["poison", "poisonType.jfif"],
    ["ground", "groundType.jpg"],
    ["flying", "flyingType.jpg"],
    ["psychic", "psychicType.jpg"],
    ["bug", "bugType.jpg"],
    ["rock", "rockType.png"],
    ["ghost", "ghostType.jpg"],
    ["dragon", "dragonType.jpg"],
    ["dark", "darkType.jpg"],
    ["steel", "steelType.jpg"],
    ["fairy", "fairyType.jpg"]
]);
  fetch(url)
    .then(function(response) {

      let results = "<div class='main-results'>INVALID POKEMON</div>";
      document.getElementById("pokeData").innerHTML = results;
      return response.json();
    }).then(function(json) {
      let results = "<div class='main-results'>";
      results += "<div class='name-id'>" + capitalizeFirstLetter(json.name) + " #" + json.id + "</div>";
      for(i = 0; i < json.types.length; ++i) {
        results += capitalizeFirstLetter(json.types[i].type.name) + " ";
      }
      results += "<div class='poke-images'>";

      if(json["sprites"]["versions"]["generation-vii"]["ultra-sun-ultra-moon"]["front_shiny"] != null) { 
	
        results += "<div class='image-container'><img class='poke-image' src='" + json["sprites"]["versions"]["generation-vii"]["ultra-sun-ultra-moon"]["front_default"] + "'</img></div>";
        results += "<div class='image-container'><img class='poke-image' src='" + json["sprites"]["versions"]["generation-vii"]["ultra-sun-ultra-moon"]["front_shiny"] + "'</img></div>";
      }
      else {
	results += "<div class='image-container'> <img class='poke-image' src='" + json["sprites"]["front_default"] + "'</img></div>";
	results += "<div class='image-container'> <img class='poke-image' src='" + json["sprites"]["front_shiny"] + "'</img></div>";

      }
      results += "</div>";
      const statsArray = ["HP", "ATK", "DEF", "SP.ATK", "SP.DEF", "SPEED"];
      results += "<p><strong>Base Stats</strong></p>";
      results += "<div class='stats-container'>";	
      for(i = 0; i < json.stats.length; ++i) {
        results += "<div class='stat'>" + statsArray[i] + ": ";
    	results += json.stats[i].base_stat + "</div>";
      }
      results += "</div>";
      type = typeMap.get(json.types[0].type.name);
  
      document.getElementById("pokeData").style.backgroundImage = "url('PokemonImages/" + type + "')";
      document.getElementById("pokeData").innerHTML = results;

      const url2 = json.location_area_encounters;
      fetch(url2)
        .then(function(response) {
          return response.json();
	}).then(function(json) {
        bestRouteMap = new Map();
	
	for(i = 0; i < json.length; ++i) {
	  for(j = 0; j < json[i]["version_details"].length; ++j) {
	    tempValueObj = {
		    routeName: null,
		    chance: null,
		    conditions: null,
		    method: null

	    }

	    for(k = 0; k < json[i]["version_details"][j]["encounter_details"].length; ++k) {
	      versionKey = json[i]["version_details"][j]["version"]["name"];
	      currentChance = json[i]["version_details"][j]["encounter_details"][k]["chance"];
              currentMethod = json[i]["version_details"][j]["encounter_details"][k]["method"]["name"];
              currentConditions = json[i]["version_details"][j]["encounter_details"][k]["condition_values"];

	      if(isStandardMethod && !(currentMethod == "walk" || currentMethod == "surf" || currentMethod == "old-rod" || currentMethod == "good-rod" || currentMethod == "super-rod")) {
		continue;
	      }

	      bestRoute = bestRouteMap.get(versionKey);

  	      if(tempValueObj["chance"] != null) {
		if(tempValueObj["routeName"] == json[i]["location_area"]["name"] && conditionsEquals(tempValueObj["conditions"], currentConditions) && tempValueObj["method"] == currentMethod) {
	          tempValueObj["chance"] += currentChance;
			console.log(json[i])
		}
		else {
                  tempValueObj["chance"] = currentChance;
		  tempValueObj["method"] = currentMethod;
		  tempValueObj["conditions"] = currentConditions;
		}

	      }
	      else {
		tempValueObj["routeName"] = json[i]["location_area"]["name"];
		tempValueObj["chance"] = currentChance;
		tempValueObj["conditions"] = currentConditions;
		tempValueObj["method"] = currentMethod;

	      }

              if(bestRoute == null || bestRoute["chance"] < tempValueObj["chance"]) {
                bestRouteMap.set(versionKey, tempValueObj);
              }

	    }


	  }
	}
	results = "";
	tableString = "<table border=1 width=100%><tr><td>Version</td><td>Location</td><td>Encounter Rate</td><td>Method</td></tr>";
	for(let [key, value] of bestRouteMap) {
          tableString += "<tr><td>" + printableString(key) + "</td><td>" + printableString(value["routeName"]) + "</td><td>" + value["chance"] + "%</td><td>" + printableString(value["method"]) + "</td></tr>";
        }

	tableString += "</table>";
	results += tableString;
        document.getElementById("locationData").innerHTML = results;

	});
    });

});

function conditionsEquals(object1, object2) {
  if(object1.length != object2) {
    return false;
  }
  for(y = 0; y < object1.length; ++y) {
   if(object1[y]["name"] != object2[y]["name"]) return false;
  }
  return true;
}

function printableString(string) {
  string = capitalizeFirstWords(string);
  string = removeWord(string, "Area");
  return string.replace(/-/g,' ');

}
function removeWord(string, wordToRemove) {
  return string.replace(wordToRemove, "");

}

function capitalizeFirstWords(string) {
  newString = "";
  while(string.search("-") != -1) {
    index = string.search("-");
    newString += capitalizeFirstLetter(string.substring(0, index + 1));
    string = string.substring(index + 1);
  }
  newString += capitalizeFirstLetter(string);
  return newString;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
