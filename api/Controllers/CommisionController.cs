using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AvalphaTechnologies.CommissionCalculator.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommisionController : ControllerBase
    {
        // Commission rates as constants for maintainability
        private const decimal AvalphaLocalRate = 0.20m;      // 20%
        private const decimal AvalphaForeignRate = 0.35m;    // 35%
        private const decimal CompetitorLocalRate = 0.02m;   // 2%
        private const decimal CompetitorForeignRate = 0.0755m; // 7.55%

        [HttpPost]
        [ProducesResponseType(typeof(CommissionCalculationResponse), 200)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public IActionResult Calculate([FromBody] CommissionCalculationRequest request)
        {
            // Validate request
            var validationErrors = ValidateRequest(request);
            if (validationErrors.Count > 0)
            {
                return BadRequest(new { errors = validationErrors });
            }

            // Calculate Avalpha commission
            var avalphaLocalCommission = request.LocalSalesCount * request.AverageSaleAmount * AvalphaLocalRate;
            var avalphaForeignCommission = request.ForeignSalesCount * request.AverageSaleAmount * AvalphaForeignRate;
            var avalphaTotal = avalphaLocalCommission + avalphaForeignCommission;

            // Calculate Competitor commission
            var competitorLocalCommission = request.LocalSalesCount * request.AverageSaleAmount * CompetitorLocalRate;
            var competitorForeignCommission = request.ForeignSalesCount * request.AverageSaleAmount * CompetitorForeignRate;
            var competitorTotal = competitorLocalCommission + competitorForeignCommission;

            // Return response with rounded values
            return Ok(new CommissionCalculationResponse
            {
                AvalphaTechnologiesCommissionAmount = Math.Round(avalphaTotal, 2),
                CompetitorCommissionAmount = Math.Round(competitorTotal, 2),
                // Additional details for better UI display
                Details = new CommissionDetails
                {
                    LocalSalesCount = request.LocalSalesCount,
                    ForeignSalesCount = request.ForeignSalesCount,
                    AverageSaleAmount = request.AverageSaleAmount,
                    AvalphaLocalCommission = Math.Round(avalphaLocalCommission, 2),
                    AvalphaForeignCommission = Math.Round(avalphaForeignCommission, 2),
                    CompetitorLocalCommission = Math.Round(competitorLocalCommission, 2),
                    CompetitorForeignCommission = Math.Round(competitorForeignCommission, 2)
                }
            });
        }

        private List<string> ValidateRequest(CommissionCalculationRequest request)
        {
            var errors = new List<string>();

            if (request.LocalSalesCount < 0)
                errors.Add("Local sales count must be 0 or greater");

            if (request.ForeignSalesCount < 0)
                errors.Add("Foreign sales count must be 0 or greater");

            if (request.AverageSaleAmount < 0)
                errors.Add("Average sale amount must be 0 or greater");

            if (request.LocalSalesCount == 0 && request.ForeignSalesCount == 0)
                errors.Add("At least one sale (local or foreign) is required");

            if (request.LocalSalesCount > 1000000)
                errors.Add("Local sales count exceeds maximum limit (1,000,000)");

            if (request.ForeignSalesCount > 1000000)
                errors.Add("Foreign sales count exceeds maximum limit (1,000,000)");

            if (request.AverageSaleAmount > 10000000)
                errors.Add("Average sale amount exceeds maximum limit (£10,000,000)");

            return errors;
        }
    }

    public class CommissionCalculationRequest
    {
        [Required]
        [Range(0, 1000000, ErrorMessage = "Local sales count must be between 0 and 1,000,000")]
        public int LocalSalesCount { get; set; }

        [Required]
        [Range(0, 1000000, ErrorMessage = "Foreign sales count must be between 0 and 1,000,000")]
        public int ForeignSalesCount { get; set; }

        [Required]
        [Range(0, 10000000, ErrorMessage = "Average sale amount must be between 0 and 10,000,000")]
        public decimal AverageSaleAmount { get; set; }
    }

    public class CommissionCalculationResponse
    {
        public decimal AvalphaTechnologiesCommissionAmount { get; set; }
        public decimal CompetitorCommissionAmount { get; set; }
        public CommissionDetails? Details { get; set; }
    }

    public class CommissionDetails
    {
        public int LocalSalesCount { get; set; }
        public int ForeignSalesCount { get; set; }
        public decimal AverageSaleAmount { get; set; }
        public decimal AvalphaLocalCommission { get; set; }
        public decimal AvalphaForeignCommission { get; set; }
        public decimal CompetitorLocalCommission { get; set; }
        public decimal CompetitorForeignCommission { get; set; }
    }
}