import {Component} from '@angular/core';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {DevicesService} from './service/devices.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private backgroundMode: BackgroundMode,
        private sqlite: SQLite,
        private devicesService: DevicesService,
        private bluetoothLE: BluetoothLE
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            if (this.platform.is('android')) {
                this.permission();
            }
            this.backgroundMode.setDefaults({silent: true});
            this.backgroundMode.enable();
            this.createDatabase();
        });
    }

    private createDatabase() {
        this.sqlite.create({
            name: 'data.db',
            location: 'default' // the location field is required
        })
            .then((db) => {
                this.devicesService.setDatabase(db);
                this.devicesService.createTable().then((successCreateTable) => {
                    this.devicesService.truncate();
                }, (errorCreateTable) => {
                    console.log('errorCreateTable: ' + JSON.stringify(errorCreateTable));
                });
            })
            .then(() => {
                // console.log('Data base set up correctly');
            })
            .catch(error => {
                console.error(error);
            });
    }

    private permission() {

        this.bluetoothLE.hasPermission().then(
            successHasPermission => {
                console.log('hasPermission?' + JSON.stringify(successHasPermission));
                if (successHasPermission.hasPermission === false) {
                    this.bluetoothLE.requestPermission().then(
                        successRequestPermission => {
                            console.log('successRequestPermission' + JSON.stringify(successRequestPermission));
                        },
                        requestPermissionError => {
                            console.log('requestPermissionError' + JSON.stringify(requestPermissionError));
                        });
                }
            },
            errorHasPermission => {
                console.log('errorHasPermission' + JSON.stringify(errorHasPermission));
            });


        this.bluetoothLE.isLocationEnabled().then(
            successLocationEnable => {
                console.log('isLocationEnabled?' + JSON.stringify(successLocationEnable));
                if (successLocationEnable.isLocationEnabled === false) {
                    this.bluetoothLE.requestLocation().then(
                        successRequestLocation => {
                            console.log('requestLocation' + JSON.stringify(successRequestLocation));
                        },
                        errorRequestLocation => {
                            console.log('Error RequestLocation' + JSON.stringify(errorRequestLocation));
                        });
                }
            },
            errorLocationEnable => {
                console.log('locationEnableError' + JSON.stringify(errorLocationEnable));
            });
    }
}
