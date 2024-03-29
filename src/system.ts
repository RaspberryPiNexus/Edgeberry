/*
 *  System
 *  Interaction with system-related features.
 */
import { exec, execSync } from "child_process";
import { readFileSync } from "fs";


/*
 *  Networking
 *  Everything related to the networking interfaces
 */

// Get the SSID of the current WLAN connection
export async function system_getWirelessSSID(){
    try{
        const ssid = execSync(`iwgetid | awk -F '"' '{print $2}'` ).toString().split('\n')[0];
        return ssid;
    } catch(err){
        return 'Error: '+err;
    }
}

// Get the IP address of the WLAN connection
export async function system_getWirelessAddress( networkInterface:string ){
    try{
        const ipAddress = execSync(`ifconfig ${networkInterface} | awk -F ' *|:' '/inet /{print $3}'`).toString().split('\n')[0];
        return ipAddress;
    } catch(err){
        return 'Error: '+err;
    }
}


/*
 *  Power
 *  Shutdown, reboot, ...
 */

// Reboot the system
export async function system_restart( timeoutMs?:number ){
    try{
        if(!timeoutMs){
            // Reboot Now
            execSync(`shutdown -r now`);
        }
        else{
            // Reboot after timeout 
            setTimeout(()=>{exec(`shutdown -r now`)},timeoutMs);
        }
        return '';
    } catch(err){
        return 'Error: '+err;
    }
}

/*
 *  System Application
 *  Basically this app
 */

// Get system application version
export async function system_getApplicationVersion(){
    try{
        const npmPackage = JSON.parse(readFileSync('package.json').toString());
        return npmPackage.version;
    } catch(err){
        return 'Error: '+err;
    }
}

// Get system application version
export async function system_updateApplication(){
    try{
        // Todo
        return 'todo'
    } catch(err){
        return 'Error: '+err;
    }
}


/*
 *  Hardware
 *  Hardware features connected to the I/O of the Linux system;
 *  a buzzer and a LED. 'Cause everything is better with a buzzer
 *  and a LED connected to it. In the end, us electronics engineers,
 *  we do it for the "tsjeeptsjeep" and the "bleepbleep", right?
 */


// For the blinking logic
let primary:boolean=true;
let blinkInterval:any = null;

// Set Status indication on the LED
export function system_setStatusLed( color:string, blink?:boolean|number, secondaryColor?:string ){
    // Clear the previous state
    if( blinkInterval ) clearInterval( blinkInterval );
    setLedColor('off');

    // Static color
    if( typeof(blink) === 'undefined' || (typeof(blink) === 'boolean' && blink === false) )
    return setLedColor( color );

    // Blinking colors
    blinkInterval = setInterval(()=>{
        if( primary ){
            setLedColor( color );
        }
        else{
            setLedColor( secondaryColor?secondaryColor:'off' );
        }
        // Toggle
        primary = !primary;

    }, (typeof(blink)==='number'?blink:600));
}

// Set status indication on the buzzer
// long | short | twice
export function system_beepBuzzer( status:string ){
    switch(status){
        // Short beep
        case 'short':   setTimeout(()=>{setBuzzerState('off')},100);
                        setBuzzerState('on');
                        break;
        // Long beep
        case 'long':    setTimeout(()=>{setBuzzerState('off')},400);
                        setBuzzerState('on');
                        break;
        case 'twice':   break;

        // Turn buzzer off
        default:        setBuzzerState('off');
                        break;
    }
}


/*
 *  Actual hardware controlling functions
 */

async function initialize(){
    try{
        // The status LED has 2 colors on seperate IO pins
        // initialize the green LED (gpio26) as digital output (and digital low)
        execSync('pinctrl set 26 op dl >/dev/null 2>&1');
        // initialize the red LED (gpio19) as digital output (and digital low)
        execSync('pinctrl set 19 op dl >/dev/null 2>&1');

        // initialize the buzzer (gpio5) as digital output (and digital low)
        execSync('pinctrl set 5 op dl >/dev/null 2>&1');
    } catch (err){
        console.error('\x1b[31mStatus indicators not inititialized!\x1b[37m');
    }
}

// Initialize
initialize();

// Set the color of the LED
function setLedColor( color:string ){
    try{
        switch( color ){
            // Red
            case 'red':     execSync('pinctrl set 26 dl >/dev/null 2>&1');
                            execSync('pinctrl set 19 dh >/dev/null 2>&1');
                            break;
            // Green
            case 'green':   execSync('pinctrl set 26 dh >/dev/null 2>&1');
                            execSync('pinctrl set 19 dl >/dev/null 2>&1');
                            break;
            // Orange
            case 'orange':  execSync('pinctrl set 26 dh >/dev/null 2>&1');
                            execSync('pinctrl set 19 dh >/dev/null 2>&1');
                            break;
            // Off (for anything else)
            default:        execSync('pinctrl set 26 dl >/dev/null 2>&1');
                            execSync('pinctrl set 19 dl >/dev/null 2>&1');
                            break;
        }
    } catch(err){
        // Todo: do something with this error
    }
}

// Set the buzzer on/off
function setBuzzerState( state:string ){
    try{
        switch( state ){
            // On
            case 'on':  execSync('pinctrl set 5 dh >/dev/null 2>&1');
                        break;
            // Off (for anything else)
            default:    execSync('pinctrl set 5 dl >/dev/null 2>&1');
                        break;
        }
    } catch(err){
        // Todo: do something with this error
    }
}