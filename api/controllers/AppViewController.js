/**
 * AppViewController
 *
 * @description :: Server-side logic for managing Appviews
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  getView: function (req, res) {

    // console.log("get",req.params.appName)
    // console.log("get",req.user)
    // fixme: do case-insensitive search here!
    let defaultApp;

    PortalConfig
      .find({})
      .then(config => {
        defaultApp = config[0].value.defaultApp
        return defaultApp
      })
      .then(defaultApp => {
          return AppConfig
                  .findOneByName(req.params.appName || defaultApp)
                  .populate('owner')
      })
      .then( app => {
        // console.log("get",JSON.stringify(app))
        AppConfig.destringifyConfigs(app);

        let userInfo = _.extend(
            ( (req.user) ? _.clone(req.user) : {} ),
            {
              isLoggedIn: !_.isUndefined(req.user),
              isOwner: AppConfig.isOwner(app, req.user),
              isCollaborator: AppConfig.isCollaborator(app, req.user)
            }) 

        app.defaultApp =  defaultApp;

        return res.view('app', {
          app: app,
          userInfo: userInfo,
          ownerInfo: !app.owner ? {
            exists: false
          } : {
            id: app.owner.id,
            name: app.owner.name,
            email: app.owner.email,
            photo: app.owner.photo,
            exists: true
          },
          publicAppConfig: {
            id: app.id,
            name: app.name,
            // skinName: app.skinName,
            // appWidgets: app.appWidgets || [],
            collaborations: app.collaborations || [],
            
            skin: app.skin || {
                                holders:{
                                    AppHeader:{widgets:[]},
                                    AppFooter:{widgets:[]}
                                  }
                              },

            pages: app.pages || [],
            theme: app.theme,
            icon: app.icon,
            i18n: app.i18n,
            title: app.title,
            description: app.description,
            keywords: app.keywords,
            // dps: app.dps,
            dpsURL: app.dpsURL || "",
            // importedFromURL: app.importedFromURL,
            // importedFromAuthor: app.importedFromAuthor,
            isPublished: app.isPublished
          }
        });
      })
      .catch(function (err) {
        // console.log("ERROR", err)
        sails.log.silly(err);
        return res.notFound();
      });
  }
}      

//         var defaultApp = config[0].value.defaultApp;
//         // sails.log.debug("Get app "+(req.params.appName || defaultApp))
//         AppConfig.findOneByName(req.params.appName || defaultApp)
//           .populate('owner')
//           .then(function (app) {
//             var isOwner = AppConfig.isOwner(app, req.user);
//             var isCollaborator = AppConfig.isCollaborator(app, req.user);

//             AppConfig.destringifyConfigs(app);

//             var userInfo;
//             if (req.user) {
//               userInfo = _.extend(_.clone(req.user), {
//                 isLoggedIn: true,
//                 isOwner: isOwner,
//                 isCollaborator: isCollaborator
//               });
//             } else {
//               userInfo = {
//                 isLoggedIn: false,
//                 isOwner: isOwner,
//                 isCollaborator: isCollaborator
//               };
//             }

//             app.defaultApp =  defaultApp;

//             res.view('app', {
//               app: app,
//               userInfo: userInfo,
//               ownerInfo: !app.owner ? {
//                 exists: false
//               } : {
//                 id: app.owner.id,
//                 name: app.owner.name,
//                 email: app.owner.email,
//                 photo: app.owner.photo,
//                 exists: true
//               },
//               publicAppConfig: {
//                 id: app.id,
//                 name: app.name,
//                 skinName: app.skinName,
//                 appWidgets: app.appWidgets || [],
//                 collaborations: app.collaborations || [],
//                 pages: app.pages || [],
//                 icon: app.icon,
//                 i18n: app.i18n,
//                 title: app.title,
//                 description: app.description,
//                 keywords: app.keywords,
//                 dps: app.dps,
//                 importedFromURL: app.importedFromURL,
//                 importedFromAuthor: app.importedFromAuthor,
//                 isPublished: app.isPublished
//               }
//             });
//           }).catch(function (err) {
//             sails.log.silly(err);
//             res.notFound();
//           });
//         });    
//       }
// };

