$(document).ready(function() {
    var imgName = "";
    $('.card-gallery-image').click(function() {
        // alert('1');
        $('.card-gallery-image').removeClass('selected');
        $(this).addClass('selected');
        imgName = $(this).find('.namefileimage').html();
        // alert(imgName);
    })
    $('.btn-del-image').click(function() {

    });
    var checkViewGallery = false;
    $('#viewgallery').click(function() {
        if (checkViewGallery) {
            $(this).html('Hiện Thư viện');
            checkViewGallery = !checkViewGallery;
            $('.gallery').fadeOut();
            $('.btn-del-image').fadeOut();
        } else {
            $(this).html('Ẩn Thư viện');
            checkViewGallery = !checkViewGallery;
            $('.gallery').fadeIn();
            $('.btn-del-image').fadeIn();
        }

    });
    $('.btn-del-image-libary').click(function() {
        var id = $(this).attr('valid');
        var name = $(this).attr('id');
        // alert(id);
        // alert(name);
        var libary = $('.arrLibary').val();
        libary = libary.replace(name, '');
        $('.arrLibary').val(libary);
        var libaryDele = $('.arrLibaryRemove').val();
        libaryDele = libaryDele + '|' + name;
        $('.arrLibaryRemove').val(libaryDele);
        // alert(libary);
        $('ul').find('#li-' + id).fadeOut();
        // arrLibary

    })
})