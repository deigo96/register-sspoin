function klik(e) {
  console.log(e.parentNode.offsetParent);
  console.log(e);
}

$(document).ready(function () {
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;
  let referral = window.location.search;
  let referralUser = referral.replace("?referral=", "");
  $("#referralUser").val(referralUser);

  // validasi identitas
  $(".step1").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    let namaLengkap = $("#namaLengkap").val();
    let namaPerusahaan = $("#namaPerusahaan").val();
    let display_Perusahaan = $("#display-perusahaan");

    if (
      (display_Perusahaan.is(":hidden") && namaLengkap != "") ||
      (display_Perusahaan.is(":visible") &&
        namaLengkap != "" &&
        namaPerusahaan != "")
    ) {
      $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
      $(".secondpage").show();
      current(current_fs);
      $(".error").hide();
    } else {
      $("#namaLengkapError").show().text("Data tidak boleh kosong");
    }
  });

  // validasi informasi kontak
  $(".step2").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    let alamat = $("#alamat").val();
    let noTelepon = $("#noTelepon").val();

    if (alamat != "" && noTelepon != "") {
      if (noTelepon.length > 8) {
        validasiPhone(noTelepon);
      } else {
        $("#errorStep2").show().text("Nomor telepon tidak valid");
      }
    } else {
      $("#errorStep2").show().text("Data tidak boleh kosong");
    }
  });

  // validasi akun
  $(".step3").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    let username = $("#username").val();
    let email = $("#email").val();

    if (email != "" && username != "") {
      if (username.length < 3) {
        $(".errorStep3").show().text("Username minimal 3 karakter");
      } else {
        validasiAkun(username, email);
      }
    } else {
      $(".errorStep3").show().text("Data tidak boleh kosong");
    }
  });

  // toggle password to hide and show
  togglePassword();

  // validasi password
  $(".step4").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    let password = $("#password").val();
    let konfirmPassword = $("#konfirmPassword").val();
    let term = $("#kebijakan");

    if (password != "" && konfirmPassword != "") {
      let validPass = passMatch(password, konfirmPassword);
      if (validPass === true) {
        if(term.is(":checked")) {

          $("#progressbar li")
          .eq($("fieldset").index(next_fs))
          .addClass("active");
          $(".fifthpage").show();
          $(".progres").hide();
          $(".error").hide();
          current(current_fs);
        } else {
          $(".errorStep4").show().text("Ketentuan dan kebijakan harus disetujui");
        }
      } else {
        $(".errorStep4").show().text(validPass);
      }
    } else {
      $(".errorStep4").show().text("Data tidak boleh kosong");
    }
  });

  async function validasiPhone(notelp) {
    const [checkPhone] = await Promise.all([
      fetch(`http://localhost:8003/phone?phone=${notelp}`),
    ]);

    const phone = await checkPhone.json();

    if (phone.status === true) {
      $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
      $(".thirdpage").show();
      $(".error").hide();
      current(current_fs);
    } else {
      $("#errorStep2").show().text("Nomor telepon sudah digunakan");
    }
  }

  async function validasiAkun(name, email) {
    const [checkUser, checkEmail] = await Promise.all([
      fetch(`https://portal.gps.id/backend/api/cek_user_platform`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name }),
      }),
      fetch(`http://localhost:8003/email?email=${email}`),
    ]);

    const userName = await checkUser.json();
    const userEmail = await checkEmail.json();

    let statusUsername, statusEmail;

    if (userName.status === true) statusUsername = "Username sudah digunakan";

    if (userEmail.status === false) statusEmail = "Email sudah digunakan";
    else if (!validateEmailFormat(email)) statusEmail = "Email tidak valid";
    else statusEmail;

    if (name != "" && email != "") {
      if (
        userName.status === false &&
        userEmail.status === true &&
        statusEmail === undefined
      ) {
        $("#progressbar li")
          .eq($("fieldset").index(next_fs))
          .addClass("active");
        $(".fourthpage").show();
        $(".error").hide();
        current(current_fs);
      } else {
        $("#errorEmail").show().text(statusUsername);
        $("#errorEmail").show().text(statusEmail);
      }
    } else {
      $(".errorStep3").show().text("Data tidak boleh kosong");
    }
  }

  function current(current_fs) {
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          next_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
  }

  function validateEmailFormat(email) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  function togglePassword() {
    let togglePassword = document.querySelector("#togglePassword");
    let password = document.querySelector("#password");

    togglePassword.addEventListener("click", function (e) {
      // toggle the type attribute
      const type =
        password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);
      // toggle the eye slash icon
      this.classList.toggle("fa-eye");
    });

    let toggleKonfirmPassword = document.querySelector(
      "#toggleKonfirmPassword"
    );
    let konfirmPassword = document.querySelector("#konfirmPassword");

    toggleKonfirmPassword.addEventListener("click", function (e) {
      // toggle the type attribute
      const type =
        konfirmPassword.getAttribute("type") === "password"
          ? "text"
          : "password";
      konfirmPassword.setAttribute("type", type);
      // toggle the eye slash icon
      this.classList.toggle("fa-eye");
    });
  }

  function passMatch(pass, konfirmasi) {
    let passStatus = true;
    if (pass != konfirmasi) {
      passStatus = "Password tidak sesuai";
    } else if (pass.length < 6) {
      passStatus = "Password minimal 6 karakter";
    }

    return passStatus;
  }

  $(".previous").click(function () {
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //Remove class active
    $("#progressbar li")
      .eq($("fieldset").index(current_fs))
      .removeClass("active");

    //show the previous fieldset
    previous_fs.show();

    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          previous_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
  });

  // $(".radio-group .radio").change(function () {
  //   $(this).parent().find(".radio").removeClass("selected");
  //   $(this).addClass("selected");
  // });

  $("input[type=radio][name=tipe_customer]").change(function () {
    if (this.value == "Individu") {
      $("#display-perusahaan").hide();
    } else if (this.value == "Perusahaan") {
      $("#display-perusahaan").show();
    }
  });
});
