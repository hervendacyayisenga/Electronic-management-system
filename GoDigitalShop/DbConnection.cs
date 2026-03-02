using System;
using System.Data.SqlClient;

namespace GoDigitalShop
{
    public class DbConnection
    {
        // NOTE: The connection string must be updated to match the local SQL Server instance.
        // For example: "Server=YOUR_SERVER_NAME;Database=TUESDAY_GEN_QUIZ_DB;Integrated Security=True;"
        private string connectionString = "Server=localhost;Database=TUESDAY_GEN_QUIZ_DB;Integrated Security=True;";

        public SqlConnection GetConnection()
        {
            return new SqlConnection(connectionString);
        }
    }
}
