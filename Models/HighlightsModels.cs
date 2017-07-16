using Dapper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IO;
using System.Xml;
using System.Xml.Serialization;

namespace AtmosphereWeb.Models
{
    public class FacesRequestModel
    {
        [Required]
        public Moods? Mood { get; set; }

        [Required]
        public DateParts? GroupBy { get; set; }
    }

    public class FacesGroup
    {
        public DateTimeOffset StartDate { get; set; }

        public FacesList Faces { get; set; }

        [XmlRoot(ElementName = "Faces")]
        public class FacesList : List<Face>
        {
        }

        public class Face
        {
            private string _url;
            private string _originalImage;

            [XmlIgnore]
            public static string ImagesEndpoint { get; set; }

            public string Url
            {
                get
                {
                    return _url;
                }
                set
                {
                    _url = $"{ImagesEndpoint}/zoomin/{value}.jpg";
                }
            }

            public string OriginalImage
            {
                get
                {
                    return _originalImage;
                }
                set
                {
                    _originalImage = $"{ImagesEndpoint}/faces/{value}";
                }
            }

            public double Score { get; set; }

            public string Date { get; set; }
        }

        public class FacesGroupFacesHandler : SqlMapper.TypeHandler<FacesList>
        {
            private static XmlSerializer serializer = new XmlSerializer(typeof(FacesList));

            public FacesGroupFacesHandler(string imagesEndpoint)
            {
                Face.ImagesEndpoint = imagesEndpoint ?? throw new ArgumentNullException(nameof(imagesEndpoint));
            }

            public override FacesList Parse(object value)
            {
                if (value == null || !(value is string valueString) || String.IsNullOrEmpty(valueString))
                    return null;

                using (var textReader = new StringReader(valueString))
                using (var xmlReader = XmlReader.Create(textReader))
                {
                    return serializer.Deserialize(xmlReader) as FacesList;
                }

            }

            public override void SetValue(IDbDataParameter parameter, FacesList value)
            {
                throw new NotImplementedException();
            }
        }
    }

    public enum Moods
    {
        Happiness,
        Sadness,
        Anger,
        Surprise,
        Contempt,
        Disgust,
        Fear
    }

    public enum DateParts
    {
        DayOfYear,
        Week,
        Month
    }
}
