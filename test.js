// var bcrypt = require('bcryptjs');

// var hash = bcrypt.hashSync('admin', 8);
// console.log(hash);
// bcrypt.genSalt(admin, function(err, salt) {
//     bcrypt.hash("B4c0/\/", salt, function(err, hash) {
//         // Store hash in your password DB. 
//         console.log(hash);
//     });
// });
var md5 = require('md5');
var pass = md5('admin');
console.log(pass);


<%BannerSliderData.forEach(function(item){%>
    <div data-p="170.00">
        <a href="<%=item.linkBanner%>" target="_blank">  <img data-u="image" src="/upload/<%=item.imageBanner%>" alt="<%=item.titleBanner%>" title="<%=item.titleBanner%>" /></a>
    </div>

    <%})%>