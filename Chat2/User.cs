using System;
using System.Collections.Generic;
using System.Text;

namespace Chat2
{
    public class User:IEquatable<User>
    {

        public string name;
        public string id;

        public User() { }
        public User(string name, string id)
        {
            this.name = name;
            this.id = id;
        }
        public bool Equals(User other)
        {
            if (other == null) return false;
            return (this.name.Equals(other.name));
        }
    }
}
