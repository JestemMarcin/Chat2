using System;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;
using System.IO;

using System.Collections.Generic;
using Newtonsoft.Json;

namespace Chat2
{
    public class Chat : WebSocketBehavior
    {
        private string _name="";
        private static List<User> onlinelist = new List<User>();


        public Chat()
          : this(null)
        {
        }

        public Chat(string prefix)
        {
            



        }


        
        protected override void OnClose(CloseEventArgs e)
        {
            onlinelist.Remove(new User() { name = _name }); ;
            Sessions.Broadcast("3"+ JsonConvert.SerializeObject(onlinelist));
            Sessions.Broadcast("5" + this.ID);


        }

        protected override void OnMessage(MessageEventArgs e)
        {

            char x = e.Data[0];
            string text=e.Data.Substring(1);

            switch (x)
            {
                case '0': //Ustawianie nicku
                    if (onlinelist.Contains(new User() { name = text })||text.Length<4) Send("1");
                    else
                    {
                        _name = text;
                        onlinelist.Add(new User() { name=_name, id=this.ID });
                        Send("2");
                    
                    ///
                    Sessions.Broadcast("3" + JsonConvert.SerializeObject(onlinelist));
                    }
                    break;
                case '1': // WYSYłanie wiadomości 
                    string[] tab = JsonConvert.DeserializeObject<  string[] > (text);
                    //tutu invalid ip.,.,+ sessions.sessions..
                    if (tab[0] !=null)Sessions.SendTo("4" + JsonConvert.SerializeObject(new string[] { this.ID, tab[1] }), tab[0]);
                    //onlinelist.Find(x => x.name.Contains(tab[0])).id

                    break;



            }
        }

        protected override void OnOpen()
        {
            Sessions.Broadcast("3" + JsonConvert.SerializeObject(onlinelist));
        }
        ////////////////////////////////////////////////////////////////////////////////

       


    }
}