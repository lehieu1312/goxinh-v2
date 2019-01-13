$(document).ready(function () {
  //Change data select edit product search
  $("#slNhomSanPham").on("change", function () {
    var idProduct = this.value;

    $.ajax({
      url: "/admin/product-search/get-one",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        id: idProduct
      }),
      success: function (response) {
        if (response.status == 1) {
          $("#txtMaPhuTung").val(response.data.maPhuTung.giaTri);
          $("#txtMaPhuTungKhac").val(response.data.maPhuTungKhac.giaTri);
          $("#txtMaHieuNM").val(response.data.maHieuNM.giaTri);

          $("#txtTenHang").val(response.data.tenHang.giaTri);
          $("#txtThongSoKyThuat").val(response.data.thongSoKyThuat.giaTri);
          $("#txtDungBP").val(response.data.dungBP.giaTri);
          $("#txtDungChoXe").val(response.data.dungChoXe.giaTri);
          $("#txtLoaiHang").val(response.data.loaiHang.giaTri);
          $("#txtDonViTinh").val(response.data.donViTinh.giaTri);
          $("#txtGiaBanBuon1").val(response.data.giaBanBuon1.giaTri);

          $("#txtGiaBanBuon2").val(response.data.giaBanBuon2.giaTri);
          $("#txtGiaBanBuon3").val(response.data.giaBanBuon3.giaTri);
          $("#txtGiaBanLe").val(response.data.giaBanLe.giaTri);
          $("#txtTrongLuong").val(response.data.trongLuong.giaTri);
          $("#txtTheTich").val(response.data.theTich.giaTri);

          $("#txtQuyCachThung").val(response.data.quyCachThung.giaTri);
          $("#txtTenHangTiengTrung").val(
            response.data.tenHangTiengTrung.giaTri
          );
          $("#txtDonViTiengTrung").val(response.data.donViTiengTrung.giaTri);

          $("#txtLoaiHangTiengTrung").val(
            response.data.loaiHangTiengTrung.giaTri
          );
          $("#txtThongSoKyThuatTiengTrung").val(
            response.data.thongSoKyThuatTiengTrung.giaTri
          );
          $("#txtGhiChu1").val(response.data.ghiChu1.giaTri);
          $("#txtGhiChu2").val(response.data.ghiChu2.giaTri);
          $("#txtGhiChu3").val(response.data.ghiChu3.giaTri);
          $("#txtGhiChu4").val(response.data.ghiChu4.giaTri);
          $("#txtGhiChu5").val(response.data.ghiChu5.giaTri);
          $("#txtGhiChu6").val(response.data.ghiChu6.giaTri);

          // $("#ckMaPhuTung").prop("checked", true);
          $("#ckMaPhuTungKhac").prop("checked", true);
          $("#ckMaHieuNM").prop("checked", true);
          $("#ckTenHang").prop("checked", true);
          $("#ckThongSoKyThuat").prop("checked", true);
          $("#ckDungBP").prop("checked", true);
          $("#ckDungChoXe").prop("checked", true);
          $("#ckDonViTinh").prop("checked", true);
          // $('input[type="checkbox"]').each(function () {
          //   $(this).prop("checked", true);
          // });
        } else {
          alert(response.msg);
        }
      }
    });
  });

  // Handle libary

  var checkViewGallery = false;
  $("#viewgallery").click(function () {
    if (checkViewGallery) {
      checkViewGallery = !checkViewGallery;
      $(".gallery").fadeOut();
    } else {
      checkViewGallery = !checkViewGallery;
      $(".gallery").fadeIn();
    }
  });
  $(".btn-del-image").click(function () {
    var name = $(this).attr("valid");
    var id = $(this).attr("id");
    var libary = $(".arrLibary").val();
    libary = libary.replace(name, "");
    $(".arrLibary").val(libary);
    var libaryDele = $(".arrLibaryRemove").val();
    libaryDele = libaryDele + "|" + name;
    $(".arrLibaryRemove").val(libaryDele);

    $("ul")
      .find("#li-" + id)
      .fadeOut();
  });

  /////////////////////////////////DELETE Multi//////////////////////////////////
  $("#deletemulti").click(function () {
    var product_arr = [];
    $("#product-search-table input[type=checkbox]").each(function () {
      if ($(this).is(":checked")) {
        var id = $(this).attr("id");
        product_arr.push(id);
      }
    });

    if (product_arr.length > 0) {
      var rep = confirm("Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?");

      if (rep == true) {
        $.ajax({
          url: "/admin/product-search/del",
          type: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(product_arr),

          success: function (response) {
            if (response.status == true) {
              alert("Đã xóa thành công.");
              location.reload();
            } else {
              alert(response.msg);
            }
          }
        });
      }
    } else {
      alert("Không có sản phẩm nào được chọn để xóa");
    }
  });

  /////////////////////////////////DELETE Multi Users//////////////////////////////////
  $("#deletemultiuser").click(function () {
    var users_arr = [];
    $("#users-table input[type=checkbox]").each(function () {
      if ($(this).is(":checked")) {
        var id = $(this).attr("id");
        users_arr.push(id);
      }
    });

    if (users_arr.length > 0) {
      var rep = confirm("Bạn có chắc chắn muốn xóa các users đã chọn?");

      if (rep == true) {
        $.ajax({
          url: "/admin/users/del",
          type: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(users_arr),

          success: function (response) {
            if (response.status == true) {
              alert("Đã xóa thành công.");
              location.reload();
            } else {
              alert("Lỗi: " + response.msg);
            }
          }
        });
      }
    } else {
      alert("Không có user nào được chọn để xóa");
    }
  });

  /////////////////////////////////DELETE Multi Permision//////////////////////////////////
  $("#deletemultipermision").click(function () {
    var users_arr = [];
    $("#permision-table input[type=checkbox]").each(function () {
      if ($(this).is(":checked")) {
        var id = $(this).attr("id");
        users_arr.push(id);
      }
    });

    if (users_arr.length > 0) {
      var rep = confirm("Bạn có chắc chắn muốn xóa các permision đã chọn?");

      if (rep == true) {
        $.ajax({
          url: "/admin/permision/del",
          type: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(users_arr),

          success: function (response) {
            if (response.status == true) {
              alert("Đã xóa thành công.Lưu ý - những permision đã tồn tại user sẽ không được xóa!");
              location.reload();
            } else {
              alert("Lỗi: " + response.msg);
            }
          }
        });
      }
    } else {
      alert("Không có permision nào được chọn để xóa");
    }
  });

  ////// Sort column
  $("#btn-submit-sort").on("click", function () {
    var dataValue = $("#sortable").sortable("toArray", {
      attribute: "data-index"
    });
    var dataCode = $("#sortable").sortable("toArray", {
      attribute: "data-code"
    });

    var arrDataText = [];

    $(".input-group").each(function () {
      var codeText = $(this)
        .find(".txtTilte")
        .val();
      arrDataText.push(codeText);
    });
    var arrData = [];
    for (var i = 0; i < dataValue.length; i++) {
      var objData = {};
      objData.number = i;
      objData.code = dataCode[i];
      objData.text = arrDataText[i];
      arrData.push(objData);
    }

    $.ajax({
      url: "/admin/setting-order-col",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(arrData),

      success: function (response) {
        if (response.status == true) {
          alert("Đã lưu thành công.");
          location.reload();
        } else {
          alert("Lỗi: " + response.msg);
        }
      }
    });
  });
});