angular.module('recordingApp', [])
  .controller('purecloudController', function ($scope) {
    var _self = this;

    let redirectUri = 'https://localhost/index.html';
    let clientId = '89f29367-dc0e-4fd0-9f55-7175a73ee600';
    let environment = 'mypurecloud.ie'
    const platformClient = require('platformClient');


    const client = platformClient.ApiClient.instance
    client.setPersistSettings(true);
    // Set Environment (in case page reloaded)
    client.setEnvironment(environment);

    let apiInstance = new platformClient.UsersApi();

    showSpinner('spinnerMain', false);
    $('#resultSuccess').hide();
    $('#resultFailed').hide();

    client.loginImplicitGrant(clientId, redirectUri)
      .then(() => {
        console.log('user authenticated');
        getMe().then(function (getMeResponse) {
          console.log('userId', getMeResponse.userId);
          $("#orgDetails").text(`${getMeResponse.orgName}`);


        }).catch(function (err) {

        })

      })
      .catch((err) => {
        // Handle failure response
        console.log(err);
      });

    $scope.setCurrentConversation = function (item) {
      _self.selectedConversation = item;
      console.log(`setCurrentConversation2 to ${item.conversationId}`);
      getRecordingConversationId(item.conversationId)
    }

    function getMe() {
      console.log('getMe');

      return new Promise(function (resolve, reject) {
        try {
          apiInstance.getUsersMe({ "expand": ["organization"] })
            .then((data) => {
              //console.log(`getUsersMe success! data: ${JSON.stringify(data, null, 2)}`);
              console.log('getUsersMe success!');
              let ret = {
                "userId": data.id,
                "userName": data.name,
                "orgName": data.organization.name
              }
              resolve(ret);
            })
            .catch((err) => {
              console.log('There was a failure calling getUsersMe');
              console.error(err);
              reject(err);
            });
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    }



    _self.createUser = function () {
      let user = $(txtUser).val();
      let mail = $(txtMail).val();
      console.log(`createUser for ${user} and ${mail}`);
      createUser(user, mail);

    }

    function createUser(_name, _mail) {
      console.log('createUser');
      showSpinner('spinnerMain', true);

      let body = {
        "name": _name,
        "email": _mail
      }

      apiInstance.postUsers(body)
        .then((data) => {
          console.log(`postUsers success! data: ${JSON.stringify(data, null, 2)}`);
          // send invite

          let opts = {
            'force': false // Boolean | Resend the invitation even if one is already outstanding
          };

          apiInstance.postUserInvite(data.id, opts)
            .then(() => {
              console.log('postUserInvite returned successfully.');
              showSpinner('spinnerMain', false);
              $('#resultSuccess').fadeIn();
            })
            .catch((err) => {
              console.log('There was a failure calling postUserInvite');
              console.error(err);
              showSpinner('spinnerMain', false);
              $('#resultFailed').fadeIn();
            });


        })
        .catch((err) => {
          console.log('There was a failure calling postUsers');
          console.error(err);
          showSpinner('spinnerMain', false);
          $('#resultFailed').fadeIn();
        });


    }


    function showSpinner(_spinner, _bool) {
      if (_bool) {
        $('#' + _spinner).fadeIn();
        $('#resultSuccess').hide();
        $('#resultFailed').hide();

      } else {
        $('#' + _spinner).fadeOut();

      }
    }




  });