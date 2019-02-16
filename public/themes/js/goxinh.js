$('#myModal').modal('show');
$(document).ready(function () {
    $('#btn-order-buy-product').click(() => {
        var idProduct, idProductSync, soLuong, slGiaoHang, slMauSac;
        idProduct = $('#idproduct').val();
        idProductSync = $('#idproductsync').val();
        soLuong = $('#soluongsanpham').val();
        slGiaoHang = $('#slGiaohang').val();
        slMauSac = $('#slMausac').val();
        if (soLuong < 1) {
            return alert('Số lượng sản phẩm phải lớn hơn 0.');
        }
        // location.href = "/order-product?idp=" + idProduct + '&idps=' + idProductSync + '&idsip=' + idSizeProduct + '&sl=' + soLuong + '&su=' + sumaryMoney;
        $.post(
            '/order-cart', {
                idProduct,
                idProductSync,
                soLuong,
                slGiaoHang,
                slMauSac
            },
            function (data) {
                if (data.status === true) {
                    location.href='/cart';
                }else{
                    alert(data.msg);
                }
            }
        )
    });
    // $("#list").attr( "selectedIndex", -1 );
    $("#sizeList").change(function () {
        var sizeID = $("#sizeList option:selected").val();
        // console.log(sizeID);
        $.post(
            '/getprice-sizeproduct', {
                idSizeProduct: sizeID
            },
            function (data) {
                if (data.status == 1) {
                    // console.log('data: ' + JSON.stringify(data));
                    // console.log(data.data);
                    $('#priceproductbysize').val(data.data.priceProduct);
                    $('#idsizeproduct').val(data.data._id);

                    $('#dongiasanpham').html(data.data.priceProduct.toLocaleString());
                    var tongtien = tinhtongtien();
                    $('#tongtiendonhang').html(tongtien.toLocaleString());
                    $('#sumarymoney').val(tongtien);
                }
            }
        )
    });
    $('#soluongsanpham').on('change', function () {
        var tong = tinhtongtien();
        $('#tongtiendonhang').html(tong.toLocaleString());
        $('#sumarymoney').val(tong);
    });

    $('.check-buy-product').change(function () {
        if (this.checked) {
            var idProduct = $(this).val();
            $.post(
                '/getprice-productsync', {
                    idProductSync: idProduct
                },
                function (data) {
                    if (data.status == 1) {
                        // console.log('data: ' + JSON.stringify(data));
                        // console.log(data.data.priceProduct);
                        var totalprice = $('#priceproductsync').val();
                        $('#priceproductsync').val(Math.floor(totalprice) + Math.floor(data.data.priceProduct));

                        var totalidproduct = $('#idproductsync').val();
                        if (totalidproduct) {
                            $('#idproductsync').val(totalidproduct + data.data._id + ';');
                        } else {
                            $('#idproductsync').val(data.data._id + ';');
                        }

                        // $('#idsizeproduct').val(data.data._id);
                        // $('#dongiasanpham').html(data.data.priceProduct.toLocaleString());
                        var tongtien = tinhtongtien();
                        $('#tongtiendonhang').html(tongtien.toLocaleString());
                        $('#sumarymoney').val(tongtien);
                    }
                }
            )
        } else {
            var idProduct = $(this).val();
            $.post(
                '/getprice-productsync', {
                    idProductSync: idProduct
                },
                function (data) {
                    if (data.status == 1) {
                        // console.log('data: ' + JSON.stringify(data));
                        // console.log(data.data.priceProduct);
                        var totalprice = $('#priceproductsync').val();
                        $('#priceproductsync').val(Math.floor(totalprice) - Math.floor(data.data.priceProduct));

                        var totalidproduct = $('#idproductsync').val();
                        if (totalidproduct) {
                            if (totalidproduct.split(';').length > 1)
                                $('#idproductsync').val(totalidproduct.replace(data.data._id + ';', ''));
                            else
                                $('#idproductsync').val(totalidproduct.replace(data.data._id + ';', ''));
                        }

                        // $('#idsizeproduct').val(data.data._id);
                        // $('#dongiasanpham').html(data.data.priceProduct.toLocaleString());
                        var tongtien = tinhtongtien();
                        $('#tongtiendonhang').html(tongtien.toLocaleString());
                        $('#sumarymoney').val(tongtien);
                    }
                }
            )
        }
    });

})

function tinhtongtien() {
    var GiaSanPham, SoLuong, TongTien;
    // GiaSanPham = $('#priceproductbysize').val();
    // console.log(GiaSanPham);
    // SoLuong = $('#soluongsanpham').val();
    // console.log(SoLuong);
    TongTien = Math.floor($('#priceproductbysize').val()) * Math.floor($('#soluongsanpham').val()) + Math.floor($('#priceproductsync').val());
    // console.log(TongTien);
    // alert(TongTien);
    return TongTien;
}

function changeimageclick(event) {
    // console.log(event);
    // alert('1');
    // $('img.avatar').attr('src', '/upload/' + data.avatar);
    var srcImg = $(event).attr("src");
    $('#img-main-product').attr('src', srcImg);
    // console.log(JSON.stringify($(this)));
    // console.log(srcImg);
}
$(window).on("load", function () {
    // alert('1');
    var sizeID = $("#sizeList option:selected").val();
    // console.log(sizeID);
    $.post(
        '/getprice-sizeproduct', {
            idSizeProduct: sizeID
        },
        function (data) {
            // console.log(data.data.priceProduct);
            if (data.status == 1) {
                // console.log(data.data);
                $('#priceproductbysize').val(data.data.priceProduct);
                $('#idsizeproduct').val(data.data._id);
                $('#dongiasanpham').html(data.data.priceProduct.toLocaleString());
                var tongtien = tinhtongtien();
                $('#sumarymoney').val(tongtien);
                $('#tongtiendonhang').html(tongtien.toLocaleString());

            }

        }
    )
})