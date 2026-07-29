import { useEffect, useState } from "react";
import { MessagePayload, isSupported } from "firebase/messaging";
import { onMessageListener } from "./firebase";
const useFCM = (token:string) => {
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const getNotificationListener = async () => {
    try {
      
      const supportedBrowser=await isSupported()
      if(supportedBrowser){
        Promise.resolve(onMessageListener(setMessages))
      }
    } catch (error) {
      
    }
  }
  useEffect(() => {
    try {
      
      if(typeof window !=="undefined"&& token){
        getNotificationListener()
      }
    } catch (error) {
      
    }
  }, [token]);
  return { messages, setMessages ,getNotificationListener};
};

export default useFCM;