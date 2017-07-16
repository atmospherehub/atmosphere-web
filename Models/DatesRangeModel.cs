using System;
using System.ComponentModel.DataAnnotations;

namespace AtmosphereWeb.Models
{
    public class DatesRangeModel
    {
        [Required]
        public DateTimeOffset? From { get; set; }

        [Required]
        public DateTimeOffset? To { get; set; }
    }
}
