/* globals simpl */
var dataFile = '/BigSemanticsService/mmdrepository.json';
var miceBaseUrl = 'http://ecologylab.net/mice?url=';
var urlLen = 70;

function getMiceUrl(url) {
  return miceBaseUrl + encodeURIComponent(url);
}

function showTable() {
  d3.xhr(dataFile, function(error, request) {
    console.log(error);
    var json = simpl.deserialize(request.response);
    var repo = json.meta_metadata_repository.repository_by_name;
    var processedRepo = {};
    
    //need to process the JSON first before we can pass it off to d3
    for(var wrapperID in repo) {
      var wrapper = repo[wrapperID];
      
      //no selector, no domain
      if((wrapper.selectors == undefined || wrapper.selectors[0].domain == undefined) && (wrapper.example_urls == undefined || wrapper.example_urls.length <= 0))
        continue;
        
      var domain = wrapper.selectors[0].domain;
      if(domain == undefined || domain.trim() == "") {
        domain = ParsedURL(wrapper.example_urls[0].url).domain;
      }
      
      var processed = {};
      
      if(processedRepo[domain]) {
        processed = processedRepo[domain];
      } else {
        processed = {
          domain: domain,
          types: [],
          urls: [],
        }
      }
      
      processed.types.push(wrapper.name);
      
      for(var key in wrapper.example_urls) {
        var url = wrapper.example_urls[key].url;
        
        if(url != undefined)
          processed.urls.push(url);
      }
      
      processedRepo[domain] = processed;
    }
    
    processedArr = [];
    for(var key in processedRepo) {
      processedArr.push(processedRepo[key]);
    }
    
    var table =
      d3.select("#content").append("table").attr("id", "example_table");
    table.attr("class", "table table-hover");
    var header = table.append("thead").append("tr");
    header.append("th").text("Domain");
    header.append("th").text("Types (Wrappers)");
    header.append("th").text("Examples (in MICE)");
    var rows = table.append("tbody").selectAll("tr").data(processedArr);
    var row = rows.enter().append("tr");
    row.append("td")
      .attr("class", "domain")
      .text(function(d) {
        return d.domain;
      });
    var td1 = row.append("td")
                .attr("class", "type")
                .append("ul")
                .selectAll("li")
                .data(function(d) { 
                  return d.types;
                })
                .enter();
    td1.append("li")
      .attr("class", "type_span")
      .text(function(d) { return d; });
    var td2 = row.append("td")
                .attr("class", "url")
                .append("ul")
                .selectAll("li")
                .data(function(d) { return d.urls; })
                .enter();
    td2.append("li").append("a")
      .attr("class", "url_anchor")
      .attr("target", "_blank")
      .attr("href", function(d) { return getMiceUrl(d); })
      .text(function(d) {
        if (d.length > urlLen) {
          return d.substring(0, urlLen) + "...";
        }
        return d;
      });
  });
}

$(document).ready(function() {
  showTable();
});