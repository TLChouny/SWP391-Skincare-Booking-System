using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.Data.Enum
{
    public enum UserRole
    {
        [EnumMember(Value = "custommer")]
        Custommer,
        [EnumMember(Value = "manager")]
        Manager,
        [EnumMember(Value = "staff")]
        Staff,
        [EnumMember(Value = "admin")]
        Admin
    }
}