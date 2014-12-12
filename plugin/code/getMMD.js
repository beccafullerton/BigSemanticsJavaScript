 
/*global console, XMLHttpRequest, PrefixCollection, extractParams, getDomain, getSuffix, simplDeserialize*/

var testList = ["http://dl.acm.org/inst_page.cfm?id=1013772", "http://www.asknature.org/browse?selected=strategy|501|531|541&type=aof", "http://www.asknature.org/browse?selected=strategy|921|971|1021&type=aof", "http://www.asknature.org/browse?selected=strategy|1&type=aof", "http://www.asknature.org/media/image/192", "http://www.asknature.org/product/9db08f87c7bb21d1cd485fb33f64ca50", "http://www.asknature.org/strategy/efd9f97ba5240b796b855c9bd5ee8397", "http://www.asknature.org/strategy/b91cc7c16934434bb7c01ecbd8ad286c", "http://www.asknature.org/browse?selected=strategy|501|516&type=aof", "http://www.asknature.org/browse?selected=strategy|921|971&type=aof", "http://us.asos.com/Women-Dresses-Summer-Dresses/vxlwy/?cid=10860", "http://www.citeulike.org/tag/semantic", "http://www.citeulike.org/user/yoelabreu84/tag/semantic", "http://orange.sims.berkeley.edu/cgi-bin/flamenco.cgi/famuseum/Flamenco?q=heaven_earth:29&group=heaven_earth", "http://www.flickr.com/photos/kali-kold/", "http://www.flickr.com/photos/barockschloss/tags/potato/", "http://www.fondation-langlois.org/html/e/liste.php?Selection=PUB#", "http://www.fondation-langlois.org/html/e/liste.php?Selection=PRO+col", "http://www.fondation-langlois.org/html/e/research.php?Filtres=1&MotsCles=Love&Numero=&zoom=1&Format=1", "http://www.fondation-langlois.org/html/e/research.php?Filtres=1&MotsCles=Art+and+Nature&Numero=t000196&zoom=1&Format=1&Submit.x=20&Submit.y=2", "http://www.getty.edu/art/gettyguide/displayObjectList?cat=2033763", "http://www.getty.edu/art/gettyguide/displayObjectList?cat=2033762", "http://www.getty.edu/art/gettyguide/exploreArt?typ=2033760", "http://www.childrenslibrary.org/icdl/BookPreview?bookid=shiwhit_00900083amp;route=text_English_floweramp;lang=Englishamp;msg=amp;ilang=English", "http://www.instructables.com/id/Tomato-Water-Bloody-Mary/", "http://www.instructables.com/id/Cheesy-Potato-Shotz/", "http://www.instructables.com/tag/type-id/category-food/keyword-tomato/", "http://www.instructables.com/tag/type-id/category-food/keyword-potato/", "http://www.jstor.org/action/expandCollapseDecadeGroup?close=2000s&journalCode=compeduc#2000s", "http://www.nsf.gov/div/index.jsp?div=IIS", "http://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503302", "http://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503581", "http://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503286", "http://www.nsf.gov/staff/staff_list_all.jsp?org=NULL", "http://domain.opendns.com/wikipedia.org", "http://domain.opendns.com/boardgamegeek.com", "http://www.uspto.gov/web/patents/classification/uspc725/defs725.htm", "http://www.tribunalvoices.org/voices/interview/25", "http://www.tribunalvoices.org/voices/interview/5", "http://www.tribunalvoices.org/voices/interviews", "http://www.tribunalvoices.org/voices/index.html", "http://www.tribunalvoices.org/voices/video/588", "http://www.tribunalvoices.org/voices/video/327", "http://www.tripadvisor.com/Attraction_Review-g60713-d104675-Reviews-Golden_Gate_Bridge-San_Francisco_California.html", "http://tvtropes.org/pmwiki/pmwiki.php/Main/TheGunslinger", "http://tvtropes.org/pmwiki/pmwiki.php/Main/ImprobableAimingSkills", "http://www.youtube.com/watch?v=NLlGopyXT_g", "https://www.youtube.com/watch?v=KUOVJeOR77M", "https://www.youtube.com/user/guggenheim", "https://www.youtube.com/user/PTXofficial", "https://www.youtube.com/results?search_query=search", "https://www.youtube.com/results?search_query=windows+phone", "http://www.amazon.com/Twilight-Saga-Breaking-Two-Disc-Special/dp/B002BWP49C", "http://www.amazon.com/Samsung-UN60D7000-60-Inch-1080p-Silver/dp/B004QFGGTY", "http://www.amazon.com/Deathly-Hallows-Movie-Only-Edition-UltraViolet/dp/B005O30Y5Y", "http://www.amazon.com/Acer-C720-Chromebook-11-6-Inch-2GB/dp/B00FNPD1VW/", "http://www.amazon.com/Discovery-Daft-Punk/dp/B000059MEK", "http://www.anthropologie.com/anthro/product/clothes-dresses/4130580810078.jsp?cm_sp=Grid-_-4130580810078-_-Regular_3", "http://store.apple.com/us/product/H9345LL/A/hp-photosmart-5520-e-all-in-one-printer?fnode=000105072b", "http://store.apple.com/us/buy-mac/imac?product=ME087LL/A&step=config", "http://store.apple.com/us/buy-ipad/ipad-air?product=MD786LL/A&step=accessories", "http://store.apple.com/us/buy-iphone/iphone5c?cppart=UNLOCKED/US&product=ME495LL/A&step=accessories", "http://us.asos.com/Warehouse-Floral-Skater-Dress/12p10b/?iid=3735865&cid=15801&sh=0&pge=0&pgesize=36&sort=-1&clr=Multi&mporgp=L1dhcmVob3VzZS9XYXJlaG91c2UtRmxvcmFsLVNrYXRlci1EcmVzcy9Qcm9kLw..", "http://www.bestbuy.com/site/samsung-60-class-60-diag--led-1080p-120hz-smart-hdtv/7827055.p", "http://www.bestbuy.com/site/42-class-42-diag--led-1080p-120hz-hdtv/8976043.p;jsessionid=24CDBE3978F5952F7E9C65D34D5FB08A.bbolsp-app01-115?id=1218960132416&skuId=8976043&st=categoryid$abcat0101000&cp=1&lp=1", "http://www.ebay.com/itm/HomCom-Brown-Square-Microfiber-Storage-Ottoman-Footstool-Foot-Rest-Stool-Cube-/111078764834", "http://www.etsy.com/listing/117020598/new-york-continuous-arm-windsor-chair-by?ref=fp_treasury_8", "http://www.forever21.com/Product/Product.aspx?BR=f21&Category=sale_women&ProductID=2000072158&VariantID=", "http://www.hm.com/us/product/27027?article=27027-B&piaDept=Subdepartment_ladies&piaType=Large_picture", "http://www.modcloth.com/shop/dresses/midnight-sun-dress-in-navy", "http://www.modcloth.com/shop/best-selling-dresses", "http://www.newegg.com/Product/Product.aspx?Item=N82E16813128532", "http://www.newegg.com/Product/Product.aspx?Item=N82E16834257878", "http://www.newegg.com/All-Laptops-Notebooks/SubCategory/ID-32?Pagesize=100", "http://www.overstock.com/Home-Garden/Bodipedic-Essentials-8-inch-Queen-size-Memory-Foam-Mattress/6153386/product.html?rcmndsrc=4", "http://www.samsclub.com/sams/cortina-pub-back-reclining-living-room-3-pcs/prod2360758.ip?navAction=push", "http://m.samsclub.com/ip/showtime-reclining-sectional-with-console-storage/180248", "http://www.target.com/p/keurig-elite-single-cup-home-brewing-system-k40/-/A-10174593#prodSlot=medium_1_1", "http://m.target.com/p/threshold-farrah-fretwork-window-panel/-/A-13976559", "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=8674056", "http://www.uniqlo.com/us/women/tops/t-shirts/supima-cotton-crew-neck-long-sleeves/women-supima-cotton-crew-neck-long-sleeve-t-shirt-086844.html#76", "http://www.walmart.com/ip/The-Hobbit-An-Unexpected-Journey-DVD-UltraViolet-Widescreen/23263613", "http://www.walmart.com/ip/Twister-Dance/21097609", "http://www.zara.com/us/en/woman/trousers/jacquard-trousers-with-faux-leather-piping-c358005p1841024.html", "https://www.airbnb.com/rooms/2570524?s=lpub", "http://www1.hilton.com/en_US/hi/hotel/DFWANHH/index.do;jsessionid=FA645984CF5E8826E0DD207A9049F0AE.etc42", "http://www.homeaway.com/vacation-rental/p100000", "http://www.tripadvisor.com/Hotel_Review-g30196-d98474-Reviews-The_Driskill-Austin_Texas.html", "http://www.urbanspoon.com/f/114/11800/College-Station/American-Restaurants", "http://www.urbanspoon.com/r/114/875031/restaurant/College-Station/Christophers-World-Grill-Bryan", "http://www.yelp.com/biz/the-republic-college-station", "http://www.amazon.com/gp/registry/wishlist/ref=wish_list", "http://www.amazon.com/Cook-Books-amp-more/lm/R1PADW7FZALCHA/", "http://www.amazon.com/gp/bestsellers/books/6", "http://www.amazon.co.uk/gp/bestsellers/books/515344", "http://www.amazon.com/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords=ps4", "http://boardgamegeek.com/boardgame/4324/risk-the-lord-of-the-rings", "http://boardgamegeek.com/boardgamecategory/1016/science-fiction", "http://www.fondation-langlois.org/html/e/page.php?NumPage=2131", "http://www.fondation-langlois.org/html/e/page.php?NumPage=2222", "http://www.google.com/patents/US20100045705", "http://www.google.com/patents/US7953462", "http://www.imdb.com/title/tt0137523/", "http://www.imdb.com/title/tt0110912/", "http://gameinfo.na.leagueoflegends.com/en/game-info/champions/diana/", "http://gameinfo.na.leagueoflegends.com/en/game-info/champions/caitlyn/", "http://www.nsf.gov/awardsearch/showAward.do?AwardNumber=0747428", "http://www.nsf.gov/awardsearch/showAward.do?AwardNumber=0803854", "http://www.nsf.gov/awardsearch/showAward.do?AwardNumber=1123972", "http://www.nsf.gov/awardsearch/showAward?AWD_ID=1247637&HistoricalAwards=false", "http://www.nytimes.com/2012/08/28/science/earth/sea-ice-in-arctic-measured-at-record-low.html", "http://pinterest.com/pin/197525133629352022/", "http://www.rottentomatoes.com/m/inglourious_basterds/", "http://science.slashdot.org/story/12/09/14/1834239/smooth-high-definition-video-of-curiositys-landing-on-mars", "http://www.tv.com/shows/house", "http://orange.sims.berkeley.edu/cgi-bin/flamenco.cgi/famuseum/Flamenco?q=objects:81&group=objects&index=15", "http://www.getty.edu/art/gettyguide/artObjectDetails?artobj=907", "http://www.getty.edu/art/gettyguide/artObjectDetails?artobj=6706", "http://www.guggenheim.org/new-york/collections/collection-online/artwork/3484", "http://www.moma.org/collection/browse_results.php?object_id=79211", "http://www.moma.org/collection/browse_results.php?criteria=O%3ADE%3AI%3A3%7CG%3AHI%3AE%3A1&page_number=3&template_id=1&sort_order=2", "http://archive.newmuseum.org/index.php/Detail/Object/Show/object_id/5215", "http://archive.newmuseum.org/index.php/Detail/Object/Show/object_id/1840", "http://archive.newmuseum.org/index.php/Detail/Object/Show/object_id/1445", "http://rhizome.org/artbase/artwork/30306/", "http://rhizome.org/portfolios/artwork/57882/", "http://www.tate.org.uk/art/artworks/pollock-number-14-t03978", "http://www.tate.org.uk/art/artworks/duchamp-fountain-t07573", "http://whitney.org/Collection/JohnChamberlain/701579aB/", "http://whitney.org/Collection/BobThompson/", "http://whitney.org/Collection/AndyWarhol", "http://whitney.org/WatchAndListen/Artists?play_id=903", "http://www.cartoons.ac.uk/record/lse2692", "http://www.theguardian.com/commentisfree/cartoon/2013/jun/08/bilderberg", "http://public.globecartoon.com/cgi-bin/WebObjects/globecartoon.woa/wo/13.0.13.5.9", "https://www.politicalcartoons.com/cartoon/e396442b-7d98-4d34-b84d-59d9e4fa9bd0.html", "http://edocs.lib.sfu.ca/cgi-bin/Cartoons?CartoonID=960", "https://twitter.com/nytimes", "http://thingswemake.wordpress.com/", "http://babydot74.wordpress.com/", "http://chocolatebottle.wordpress.com/", "http://readcookdevour.wordpress.com/", "http://traveleat.wordpress.com/", "http://dirophil.wordpress.com/", "http://poffdevblog.wordpress.com/", "http://ohnaturelle.wordpress.com/", "http://www.flickr.com/photos/kali-kold/8345182714/", "http://www.flickr.com/photos/sobrido/8137315867/", "https://twitter.com/realjohngreen/status/486534354642821122", "https://twitter.com/asbruckman/status/497357723789692928", "http://babydot74.wordpress.com/2012/09/17/whats-for-dinner/", "http://chocolatebottle.wordpress.com/2012/09/13/disney-social-media-moms-on-the-road-charlotte/", "http://ohnaturelle.wordpress.com/2012/09/11/the-waterfront-restaurant/", "http://archive.newmuseum.org/index.php/Detail/Occurrence/Show/occurrence_id/67", "http://rhizome.org/artbase/collections/6/", "http://books.google.com/books?id=gFgnde_vwMACamp;printsec=frontcoveramp;dq=testamp;hl=enamp;sa=Xamp;ei=1ZjiU_q9J4ymyATTqoDwDwamp;ved=0CCgQ6AEwAQ", "http://books.google.com/books?id=noEyxwGQ6SkCamp;printsec=frontcoveramp;dq=testamp;hl=enamp;sa=Xamp;ei=BZniU5arNM-jyASp2YLYBwamp;ved=0CC4Q6AEwAg", "http://www.ncbi.nlm.nih.gov/pubmed?term=%22Eur+J+Immunol%22[jour]", "http://dl.acm.org/citation.cfm?id=2063231.2063237&preflayout=flat", "http://dl.acm.org/citation.cfm?id=642611.642681&preflayout=flat", "http://citeseerx.ist.psu.edu/viewdoc/similar?doi=10.1.1.167.1350&type=sc", "http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.167.1350", "http://www.citeulike.org/user/dwenig/article/828279", "http://www.citeulike.org/user/laurapapaleo/article/2901818", "http://scholar.google.com/citations?view_op=view_citation&hl=en&user=IlKLLhIAAAAJ&citation_for_view=IlKLLhIAAAAJ:u5HHmVD_uO8C", "http://ieeexplore.ieee.org/xpl/articleDetails.jsp?arnumber=1532126", "http://ieeexplore.ieee.org/xpls/icp.jsp?arnumber=1532126", "http://www.tandfonline.com/doi/ref/10.1080/15332861.2012.689565", "http://www.jstor.org/stable/25735112", "http://www.ncbi.nlm.nih.gov/pubmed/22439083", "http://www.ncbi.nlm.nih.gov/pubmed/23180662", "http://www.researchgate.net/publication/228563675_A_formula_for_the_volume_of_a_hyperbolic_tetrahedon", "http://www.sciencedirect.com/science/article/pii/S1570826808000693", "http://www.scopus.com/record/display.url?eid=2-s2.0-49949098043&origin=resultslist&sort=plf-f&src=s&sot=aut&sdt=a&sl=35&s=AU-ID%28%22Huynh%2c+David+F.%22+7005439892%29", "http://www.scopus.com/record/display.url?eid=2-s2.0-35348863146&origin=resultslist&sort=plf-f&src=s&sot=aut&sdt=a&sl=35&s=AU-ID%28%22Huynh%2c+David+F.%22+7005439892%29", "http://www.anandtech.com/print/7603/mac-pro-review-late-2013", "http://www.anandtech.com/show/6914/samsung-galaxy-s-4-review", "http://reviews.cnet.com/ps4/", "http://reviews.cnet.com/samsung-galaxy-s4/", "http://www.gdacs.org/Earthquakes/report.aspx?eventid=123892&episodeid=123892&eventtype=EQ", "http://www.disasterscharter.org/web/charter/activation_details?p_r_p_1415474252_assetId=ACT-432", "http://bks8.books.google.com/patents?id=kz_NAAAAEBAJ&printsec=abstract&img=1&zoom=1&sig=ACfU3U3KH5aI9FWAEoN6HkNrmXZT4i7ejg", "http://www.google.com/patents?id=dtIXAAAAEBAJ&output=text&pg=PA3&img=1&zoom=3&hl=en&q=fire+pit&cds=1&sig=ACfU3U11rwTzwz4BhgQj0ywkgkm6T6DKaQ&edge=0&edge=stretch&ci=108,127,774,1199", "http://www.citeulike.org/user/dwenig", "http://www.imdb.com/name/nm0000487/", "http://www.imdb.com/name/nm0000199/", "http://www.imdb.com/name/nm0004266/", "http://www.rottentomatoes.com/celebrity/keir_dullea/", "http://dl.acm.org/author_page.cfm?id=81100203284&dsp=coll", "http://dl.acm.org/author_page.cfm?id=81100091670", "http://dl.acm.org/author_page.cfm?id=81100203284&srt=meta_published_date%20dsc&role=Author&perpage=10", "http://dl.acm.org/author_page.cfm?id=81309499161", "http://www.citeulike.org/author/Hearst:MA", "http://www.citeulike.org/user/jsun/author/Hofmann:T", "http://www.flickr.com/people/maxfined/", "http://www.getty.edu/art/gettyguide/artMakerDetails?maker=1229", "http://www.getty.edu/art/gettyguide/artMakerDetails?maker=3318", "http://www.google.com/search?tbo=p&tbm=pts&hl=en&q=ininventor:%22Patricia+Maes%22", "http://www.google.com/search?tbo=p&tbm=pts&hl=en&q=ininventor:%22Natan+Linder%22", "http://scholar.google.com/citations?user=IlKLLhIAAAAJamp;hl=enamp;oi=sra", "http://www.instructables.com/member/HollyMan", "http://www.instructables.com/member/Thereisonlyme/", "http://www.moma.org/collection/artist.php?artist_id=28723", "http://archive.newmuseum.org/index.php/Detail/Entity/Show/entity_id/1848", "http://www.nsf.gov/awardsearch/advancedSearchNoScript?PILastName=test", "http://www.nsf.gov/awardsearch/advancedSearchResult?IncludeCoPI=true&PIFirstName=Andruid&PILastName=Kerne", "http://www.ncbi.nlm.nih.gov/pubmed?term=Shameli%20A[Author]&cauthor=true&cauthor_uid=23180662", "http://rhizome.org/profile/uiuuii/", "http://www.scopus.com/authid/detail.url?authorId=7005439892", "http://www.tate.org.uk/art/artists/cy-twombly-2079", "http://www.bing.com/search?q=howdyamp;go=Submitamp;qs=dsamp;form=QBLHamp;scope=web", "http://citeseerx.ist.psu.edu/showciting?doi=10.1.1.31.1768", "http://citeseerx.ist.psu.edu/search?q=pad+zooming+graphical+interface", "http://www.citeulike.org/search/all?q=latent+semantic", "http://www.getty.edu/art/collectionSearch/collectionSearch?col=museum&nh=10&pw=100%25&lk=1&qt=fire&Go.x=-260&Go.y=-187", "http://www.getty.edu/art/collectionSearch/collectionSearch?col=museum&nh=10&pw=100%25&lk=1&qt=water&Go.x=0&Go.y=0", "https://www.google.com/search?tbm=isch&hl=en&q=watergate", "http://www.google.com/search?hl=en&tbm=isch&q=earth", "http://scholar.google.com/scholar?hl=enamp;q=loveamp;btnG=amp;as_sdt=1%2C44amp;as_sdtp=", "http://scholar.google.com/citations?view_op=view_citationamp;hl=enamp;user=IlKLLhIAAAAJamp;citation_for_view=IlKLLhIAAAAJ:u5HHmVD_uO8C", "https://www.google.com/search?q=exploratory+search&sourceid=chrome&ie=UTF-8", "http://www.guggenheim.org/new-york/collections/collection-online/movements/195203", "http://www.guggenheim.org/new-york/collections/collection-online/artwork-types/195198", "http://www.guggenheim.org/new-york/collections/collection-online/artists/963/Jackson%20Pollock", "http://www.guggenheim.org/new-york/collections/collection-online/artists/1529/Vito%20Acconci", "http://ieeexplore.ieee.org/search/searchresult.jsp?searchWithin=Search_Index_Terms:art+pop", "http://www.jstor.org/action/doBasicSearch?Search=Searchamp;Query=au:%22Robert%20E.%20Wood%22",  "http://archive.newmuseum.org/index.php/Browse/modifyCriteria/facet/type_facet/id/12/mod_id/0", "http://www.nsf.gov/awardsearch/advancedSearchNoScript?Keyword=banana", "http://www.reddit.com/search?q=bananaamp;restrict_sr=offamp;sort=relevanceamp;t=all", "http://rhizome.org/artbase/tag/futurism/", "http://rhizome.org/artbase/tag/nostalgia/", "http://www.scopus.com/results/citedbyresults.url?sort=plf-f&cite=2-s2.0-56049084874&src=s&imp=t&sot=cite&sdt=a&sl=0&origin=inward", "http://www.scopus.com/results/results.url?sort=plf-f&src=s&sot=aut&sdt=a&sl=17&s=AU-ID%287005439892%29&origin=AuthorProfile&reselectAuthorsLinkName=Huynh%2c+David+F.", "http://slashdot.org/index2.pl?fhfilter=test", "http://www.tate.org.uk/art/artworks?gm=416", "http://www.tate.org.uk/art/artworks?gid=999999952", "http://www.tumblr.com/search/vinyl", "https://twitter.com/search?q=%23socialinnovation", "http://whitney.org/Collection?decade=194", "http://whitney.org/Search?query=Georgia+O%27Keeffe", "http://en.wikipedia.org/w/index.php?search=the+guildsamp;title=Special%3ASearchamp;go=Go", "http://imgur.com/search?q=league+of+legends", "http://www.pinterest.com/search/pins/?q=pencil", "http://www.reddit.com/r/gifs/search?q=grootamp;sort=relevanceamp;t=all", "http://www.tumblr.com/search/wow", "http://www.wunderground.com/US/77840?MR=1", "http://i.wund.com/US/TX/College_Station.html", "http://en.m.wikipedia.org/wiki/Nuon_Chea", "http://en.wikipedia.org/wiki/Category:Brand_name_materials", "http://en.wikipedia.org/wiki/Category:Theoretical_physicists", "http://en.wikipedia.org/wiki/Type_system", "http://en.wikipedia.org/wiki/Velcro"];


//the repo given to us by the service
var mmdRepo;

/**
* The map from meta-metadata name (currently simple name, but might be extended to fully
* qualified name in the future) to meta-metadata objects. This collection is filled during the
* loading process.
* 
*/
var repositoryByName = {};

/**
* Repository of documents with noAnchorNoQuery URL string as key.
*/
var documentRepositoryByUrlStripped = {};

/**
* Repository of documents with URL pattern as key.
*/
var documentRepositoryByPattern = {};

/**
* Repository of documents with domain as key.
*/
var documentRepositoryByDomain = {};

/**
* Repository by MIME type.
*/
var repositoryByMime = {};

/**
* Repository by suffix.
*/
var repositoryBySuffix = {};

                
/**
* Collection of URL prefixes.
*/
var urlPrefixCollection = new PrefixCollection('/');


var reselectMap = {};

//LEEEEETS GET IT STARTED IN HEEEEERE
initRepo();

function StrippedUrlEntry(metaMetadata, selector){
    this.metaMetadata = metaMetadata;
    this.selector = selector;
}

function RepositoryPatternEntry(pattern, metaMetadata, selector, isPatternFragment){
    this.pattern = pattern;
    this.metaMetadata = metaMetadata;
    this.selector = selector;
    this.isPatternFragment = isPatternFragment;
}

var MMSelectorType = {
	LOCATION : 0, 
    DOMAIN : 1, 
    SUFFIX_OR_MIME : 2, 
    DEFAULT : 3
};

function testURLS(){
    var nullCount = 0;
    for (var i in testList){
        var mmd = getDocumentMM(testList[i], "tagName");
        if (mmd == repositoryByName.rich_document){
            nullCount++;
        }
    }
    console.log(nullCount);
    console.log(testList.length);
}
                
/**
 * Load post inheritence repository
 */
function initRepo(){
	var serviceURL = "//ecology-service.cse.tamu.edu/BigSemanticsService/mmdrepository.jsonp";
	
	//make a request to the service for the mmd for the url
	var request = new XMLHttpRequest();
	request.open("GET", serviceURL, true);
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	
	request.onreadystatechange = function()
	{
		if(request.readyState == 4) {	
			if (request.status == 200) {
				var ans = request.responseText;
				//cludge ahead to remove null callback
                mmdRepo = JSON.parse(ans.substring(5, ans.length-2));
                initRepositoryByName();
                initializeLocationBasedMaps();
                initializeSuffixAndMimeBasedMaps();
                testURLS();
            } else {
				console.log("Error! XMLHttpRequest failed.");
			}
		}	

	};
	request.send();
}

function initRepositoryByName(){
    simplDeserialize(mmdRepo.meta_metadata_repository.repository_by_name);
    for (var i in mmdRepo.meta_metadata_repository.repository_by_name){
        var mmd = mmdRepo.meta_metadata_repository.repository_by_name[i];
        if (mmd.name)
            repositoryByName[mmd.name] = mmd;
        else
            break;
    }
}

//takes a url and remove query and anchor
function trimAnchorQueryPageString(url){
    return url.split("?")[0];
}

function checkForParams(selector, url){
    var params = selector.params;
    if (params !== undefined){
        var urlParams = extractParams(url, true);
        
        for (var i in params){
            var curParam = params[i];
            var paramName = curParam.name;
            var paramValue = curParam.value;
            var paramValueIsNot = curParam.value_is_not;
            var actualValue = urlParams[paramName];
            if (actualValue === undefined){
                actualValue = "";
            }

            if (paramValue !== undefined && paramValue.length > 0)
            {
                //not sure if allow_empty_value is right. couldn't find example
                var allowEmptyAndIsEmpty = curParam.allow_empty_value && actualValue.length === 0;
                if (!allowEmptyAndIsEmpty && paramValue != actualValue){
                    return false;
                }
            }

            if (paramValueIsNot !== undefined && paramValueIsNot.length > 0){
                if (paramValueIsNot == actualValue){
                    return false;
                }
            }
        }
    }
    return true;
}

function addReselectEntry(selector, mmd){
    reselectMap[selector] = mmd;
}

/**
* Get MetaMetadata. First, try matching by url_base. If this fails, including if the attribute is
* null, then try by url_prefix. If this fails, including if the attribute is null, then try by
* url_pattern (regular expression).
* 
* If that lookup fails, then lookup by tag name, to acquire the default.
* 
* @param url
* @param tagName
* @return MMD object
*/
function getDocumentMM(url, tagName) {
    var result;
    
    var noAnchorNoQueryPageString = trimAnchorQueryPageString(url);
    var strippedUrlEntries = documentRepositoryByUrlStripped[noAnchorNoQueryPageString];

   
    if (strippedUrlEntries){
      for (var i in strippedUrlEntries){
        var strippedUrlEntry = strippedUrlEntries[i];
        if (checkForParams(strippedUrlEntry.selector, url)){
          result = strippedUrlEntry.metaMetadata;
          break;
        }
      }
    }

    if (!result)
    {
      var matchingPrefix = urlPrefixCollection.getMatchingPrefix(url);
      if (matchingPrefix !== null)
      {
        result = matchingPrefix.mappedObject;
      }
    }
 
    if (!result)
    {
      var domain = getDomain(url);
      if (domain)
      {
        //  
        var entries = documentRepositoryByPattern[domain];
        
        if (entries){
          for (var e in entries){
            var entry = entries[e];
            
            try {  
                var regexMatchPart = new RegExp(entry.pattern); 
                var regexMatchWhole = new RegExp("^" + entry.pattern + "$"); 
                var matched = entry.isPatternFragment ? regexMatchPart.test(url) : regexMatchWhole.test(url);

                if (matched && checkForParams(entry.selector, url))
                {
                  result = entry.metaMetadata;
                  break;
                }
            }
            catch(error) {
                console.log("invalid regex");
            }
          }
        }
         
        if (!result)
        {
          result = documentRepositoryByDomain[domain];
          if (result)
            console.log("Matched by domain = " + domain + "\t" + result);
        }
        
      }
      
    }

    if (!result)
    {
        var suffix = getSuffix(url);

        if (suffix !== null)
          result = repositoryBySuffix[suffix];
    }
 
    //default to rich_document
    if (!result){
        console.log("couldn't find for " + url);
        result = repositoryByName.rich_document;
    }
        
    return result;
  }


/**
* Initializes HashMaps for MetaMetadata selectors by URL or pattern. Uses the ClippableDocument
* and Document base classes to ensure that maps are only filled with appropriate matching
* MetaMetadata.
*/
function initializeLocationBasedMaps(){
    for (var name in repositoryByName){

        var metaMetadata = repositoryByName[name];
        
        var repositoryByUrlStripped = {};
        var repositoryByPattern = {};

        repositoryByUrlStripped = documentRepositoryByUrlStripped;
        repositoryByPattern = documentRepositoryByPattern;

        // We need to check if something is there already
        // if something is there, then we need to check to see if it has its cf pref set
        // if not, then if I am null then I win
        var selectors = metaMetadata.selectors;

        for (var i in selectors){
            var selector = selectors[i];        
            var reselectMetaMetadataName = selector.reselectMetaMetadataName;
    
            if (reselectMetaMetadataName !== undefined){
                var reselectMetaMetadata = repositoryByName[reselectMetaMetadataName];
                if (reselectMetaMetadata !== undefined){
                    reselectMetaMetadata.addReselectEntry(selector, metaMetadata);
                }
                continue;
            }
            

            var strippedPurl = selector.url_stripped;
            
            if (strippedPurl !== undefined) {
                var noAnchorNoQueryPageString = trimAnchorQueryPageString(strippedPurl);
                var strippedUrlEntries = repositoryByUrlStripped[noAnchorNoQueryPageString];
                
                if (strippedUrlEntries === undefined){
                    strippedUrlEntries = [];
                    repositoryByUrlStripped[noAnchorNoQueryPageString] = strippedUrlEntries;
                }
                
                strippedUrlEntries.push(new StrippedUrlEntry(metaMetadata, selector));
                
                metaMetadata.mmSelectorType = MMSelectorType.LOCATION;
            }
            else {
              var urlPathTree = selector.url_path_tree;
              if (urlPathTree !== undefined){
                var pp = urlPrefixCollection.add(urlPathTree);
                pp.mappedObject = metaMetadata;
                metaMetadata.mmSelectorType = MMSelectorType.LOCATION;
              }
               
              else
              {
                // use .pattern() for comparison
                var domain = selector.domain;
                var isPatternFragment = false;
                var urlPattern = selector.url_regex;
                if (urlPattern === undefined || urlPattern.length <= 0)
                {
                  urlPattern = selector.url_regex_fragment;
                  isPatternFragment = true;
                }
                if (domain !== undefined)
                {
                  if (urlPattern !== undefined)
                  {
                    var bucket = repositoryByPattern[domain];
                    if (bucket === undefined)
                    {
                      bucket = [];
                      repositoryByPattern[domain] = bucket;
                    }
                    bucket.push(new RepositoryPatternEntry(urlPattern, metaMetadata, selector, isPatternFragment));
                    metaMetadata.mmSelectorType = MMSelectorType.LOCATION;
                  } 
                  else
                  {
                    // domain only -- no pattern
                    documentRepositoryByDomain[domain] = metaMetadata;
                    metaMetadata.mmSelectorType = MMSelectorType.DOMAIN;
                  }
                }
                  
                else if (urlPattern !== undefined)
                {
                  console.log("<selector with url_regex=\"" + urlPattern + "\" but domain is not specified :(");
                }
              
              }  
            }
        }
    }
}

/**
* This initalizes the map based on mime type and suffix.
*/
function initializeSuffixAndMimeBasedMaps(){
    if (!repositoryByName)
      return;
    
    for (var name in repositoryByName)
    {
        var metaMetadata = repositoryByName[name];
        var suffixes = metaMetadata.suffixes;
        if (suffixes)
        {
            for (var i in suffixes)
            {
                var suffix = suffixes[i];
                if (!repositoryBySuffix.hasOwnProperty(suffix))
                {
                    repositoryBySuffix[suffix] = metaMetadata;
                    metaMetadata.setMmSelectorType(MMSelectorType.SUFFIX_OR_MIME);
                }
            }
        }

        var mimeTypes = metaMetadata.mime_types;
        if (mimeTypes)
        {
            for (var j in mimeTypes)
            {
                var mimeType = mimeTypes[j];
                if (!repositoryByMime.hasOwnProperty(mimeType))
                {
                    repositoryByMime[mimeType] = metaMetadata;
                    metaMetadata.setMmSelectorType(MMSelectorType.SUFFIX_OR_MIME);
                }
            }
        }
    }
}