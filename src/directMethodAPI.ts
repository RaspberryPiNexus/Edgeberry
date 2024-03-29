/*
 *  Direct Method API
 *  Invokable methods for facilitating cloud-to-device communication using Azure's 'Direct Methods'. It provides
 *  a convenient interface for calling remote actions on the device from the Azure Cloud Platform.
 */

import { cloud } from ".";
import { system_restart } from "./system";


/*
 *  Connectivity Direct API
 *  All features involving device-to-cloud connectivity
 */

/* Get the Azure IoT Hub connection parameters */
cloud.registerDirectMethod('getConnectionParameters',(req:any, res:any)=>{
    return res.send( cloud.getConnectionParameters() );
});

/* Update the Azure IoT Hub connection parameters */
cloud.registerDirectMethod('updateConnectionParameters', async(req:any, res:any)=>{
    // Check for the presence of the parameters in the payload
    if( !req.payload || !req.payload?.parameters )
    return res.status(400).send({message:'No parameters'});

    try{
        await cloud.updateConnectionParameters( req.payload.parameters );
        return res.send({message:'Successfully updated the Azure IoT Hub connection parameters'});
    } catch(err){
        return res.status(500).send({message:err});
    }
});

/* Get the Azure Device Provisioning Service parameters */
cloud.registerDirectMethod('getProvisioningParameters',(req:any, res:any)=>{
    return res.send( cloud.getProvisioningParameters() );
});

/* Update the Azure Device Provisioning Service parameters */
cloud.registerDirectMethod('updateProvisioningParameters', async(req:any, res:any)=>{
    // Check for the presence of the parameters in the payload
    if( !req.payload || !req.payload?.parameters )
    return res.status(400).send({message:'No parameters'});

    try{
        await cloud.updateProvisioningParameters( req.payload.parameters );
        return res.send({message:'Successfully updated the Azure Device Provisioning Service parameters'});
    } catch(err){
        return res.status(500).send({message:err});
    }
});

/*
 *  System Direct API
 *  All functionality related to system operations.
 */

/* Restart system */
cloud.registerDirectMethod('reboot',async(req:any, res:any)=>{
    if( await system_restart(2) )
    return res.send({message:'Restarting system'});
    return res.status(500).send({message:'System restart failed'});
});