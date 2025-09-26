using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalRecordsService.GoogleCloudConfig
{
    public class GoogleCloudConfig
    {
        public string ProjectId { get; set; } = default!;
        public string BucketName { get; set; } = default!;
        public string CredentialsPath { get; set; } = default!; 
    }
}