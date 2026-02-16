using Microsoft.AspNetCore.Mvc;
using AvalphaTechnologies.CommissionCalculator.Controllers;
using Xunit;

namespace AvalphaTechnologies.CommissionCalculator.Tests
{
    public class CommisionControllerTests
    {
        private readonly CommisionController _controller;

        public CommisionControllerTests()
        {
            _controller = new CommisionController();
        }

        #region Happy Path Tests

        [Fact]
        public void Calculate_WithValidRequest_ReturnsOkResult()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = 5,
                AverageSaleAmount = 1000m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            // Avalpha: (10 * 1000 * 0.20) + (5 * 1000 * 0.35) = 2000 + 1750 = 3750
            Assert.Equal(3750m, response.AvalphaTechnologiesCommissionAmount);

            // Competitor: (10 * 1000 * 0.02) + (5 * 1000 * 0.0755) = 200 + 377.50 = 577.50
            Assert.Equal(577.50m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_WithValidRequest_ReturnsCorrectDetails()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = 5,
                AverageSaleAmount = 1000m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.NotNull(response.Details);
            Assert.Equal(10, response.Details.LocalSalesCount);
            Assert.Equal(5, response.Details.ForeignSalesCount);
            Assert.Equal(1000m, response.Details.AverageSaleAmount);
            Assert.Equal(2000m, response.Details.AvalphaLocalCommission);
            Assert.Equal(1750m, response.Details.AvalphaForeignCommission);
            Assert.Equal(200m, response.Details.CompetitorLocalCommission);
            Assert.Equal(377.50m, response.Details.CompetitorForeignCommission);
        }

        [Fact]
        public void Calculate_OnlyLocalSales_ReturnsCorrectCommission()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 20,
                ForeignSalesCount = 0,
                AverageSaleAmount = 500m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            // Avalpha: 20 * 500 * 0.20 = 2000
            Assert.Equal(2000m, response.AvalphaTechnologiesCommissionAmount);
            // Competitor: 20 * 500 * 0.02 = 200
            Assert.Equal(200m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_OnlyForeignSales_ReturnsCorrectCommission()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 0,
                ForeignSalesCount = 15,
                AverageSaleAmount = 200m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            // Avalpha: 15 * 200 * 0.35 = 1050
            Assert.Equal(1050m, response.AvalphaTechnologiesCommissionAmount);
            // Competitor: 15 * 200 * 0.0755 = 226.50
            Assert.Equal(226.50m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_WithDecimalAverageSale_RoundsToTwoDecimalPlaces()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 3,
                ForeignSalesCount = 7,
                AverageSaleAmount = 33.33m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            // Avalpha: (3 * 33.33 * 0.20) + (7 * 33.33 * 0.35) = 19.998 + 81.6585 = 101.6565 -> 101.66
            Assert.Equal(101.66m, response.AvalphaTechnologiesCommissionAmount);
            // Competitor: (3 * 33.33 * 0.02) + (7 * 33.33 * 0.0755) = 1.9998 + 17.610915 = 19.610715 -> 19.61
            Assert.Equal(19.61m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_WithSingleSale_ReturnsCorrectCommission()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 1,
                ForeignSalesCount = 0,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(20m, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(2m, response.CompetitorCommissionAmount);
        }

        #endregion

        #region Validation Error Tests

        [Fact]
        public void Calculate_NegativeLocalSalesCount_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = -1,
                ForeignSalesCount = 5,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_NegativeForeignSalesCount_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 5,
                ForeignSalesCount = -1,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_NegativeAverageSaleAmount_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 5,
                ForeignSalesCount = 5,
                AverageSaleAmount = -100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_BothSalesCountsZero_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 0,
                ForeignSalesCount = 0,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_LocalSalesExceedsMax_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 1000001,
                ForeignSalesCount = 0,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_ForeignSalesExceedsMax_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 0,
                ForeignSalesCount = 1000001,
                AverageSaleAmount = 100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_AverageSaleExceedsMax_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 1,
                ForeignSalesCount = 1,
                AverageSaleAmount = 10000001m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_MultipleValidationErrors_ReturnsBadRequest()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = -1,
                ForeignSalesCount = -1,
                AverageSaleAmount = -100m
            };

            var result = _controller.Calculate(req);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        #endregion

        #region Boundary Tests

        [Fact]
        public void Calculate_MaxLocalSales_ReturnsOk()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 1000000,
                ForeignSalesCount = 0,
                AverageSaleAmount = 1m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(200000m, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(20000m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_MaxForeignSales_ReturnsOk()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 0,
                ForeignSalesCount = 1000000,
                AverageSaleAmount = 1m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(350000m, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(75500m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_MaxAverageSaleAmount_ReturnsOk()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 1,
                ForeignSalesCount = 0,
                AverageSaleAmount = 10000000m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(2000000m, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(200000m, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_ZeroAverageSaleAmount_ReturnsOk()
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = 5,
                AverageSaleAmount = 0m
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(0m, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(0m, response.CompetitorCommissionAmount);
        }

        #endregion

        #region Commission Rate Verification Tests

        [Theory]
        [InlineData(1, 0, 100, 20)]       // 100 * 0.20 = 20
        [InlineData(0, 1, 100, 35)]        // 100 * 0.35 = 35
        [InlineData(5, 5, 100, 275)]       // (500*0.20) + (500*0.35) = 100 + 175 = 275
        [InlineData(100, 50, 10, 375)]     // (1000*0.20) + (500*0.35) = 200 + 175 = 375
        public void Calculate_AvalphaCommission_MatchesExpected(
            int local, int foreign, decimal avg, decimal expectedAvalpha)
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = local,
                ForeignSalesCount = foreign,
                AverageSaleAmount = avg
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(expectedAvalpha, response.AvalphaTechnologiesCommissionAmount);
        }

        [Theory]
        [InlineData(1, 0, 100, 2)]         // 100 * 0.02 = 2
        [InlineData(0, 1, 100, 7.55)]      // 100 * 0.0755 = 7.55
        [InlineData(5, 5, 100, 47.75)]     // (500*0.02) + (500*0.0755) = 10 + 37.75 = 47.75
        [InlineData(100, 50, 10, 57.75)]   // (1000*0.02) + (500*0.0755) = 20 + 37.75 = 57.75
        public void Calculate_CompetitorCommission_MatchesExpected(
            int local, int foreign, decimal avg, decimal expectedCompetitor)
        {
            var req = new CommissionCalculationRequest
            {
                LocalSalesCount = local,
                ForeignSalesCount = foreign,
                AverageSaleAmount = avg
            };

            var result = _controller.Calculate(req);

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<CommissionCalculationResponse>(ok.Value);

            Assert.Equal(expectedCompetitor, response.CompetitorCommissionAmount);
        }

        #endregion
    }
}