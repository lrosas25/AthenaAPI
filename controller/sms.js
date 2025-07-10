import axios from "axios";
import querystring from 'querystring';
const smsController = {

    send: async (req, res) => {
        const url = 'http://192.168.110.86/cgi/WebCGI';
        const queryString = '1500101=account=apiuser&password=password1&port=2&destination=' + req.query.destin + '&content=' + req.query.body;
        const fullUrl = `${url}?${queryString}`;
               
        await axios.get(fullUrl, {
            
            }).then(response => {
                //console.log('Response:', response.data);
                
            }).catch(error => {
                console.error('Error:', error.message);
                
            });
            return res.status(200).json({ message: 'sent' })
       
    } 
}
//192.168.110.86/cgi/WebCGI?1500101=account=apiuser&password=password1&port=2&destination=09175964861&content=Hello+world!!
export default smsController