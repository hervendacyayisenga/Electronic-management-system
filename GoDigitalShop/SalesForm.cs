using System;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Windows.Forms;

namespace GoDigitalShop
{
    public partial class SalesForm : Form
    {
        private ComboBox cmbProduct;
        private NumericUpDown txtSaleQuantity;
        private DataGridView dgvSales;
        private int selectedSaleID = 0;
        private int originalProductID = 0;
        private DbConnection db = new DbConnection();

        public SalesForm()
        {
            InitializeComponent();
            LoadProducts();
            LoadData();
        }

        private void InitializeComponent()
        {
            this.Text = "Manage Sales";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;

            Label lblProduct = new Label() { Text = "Product:", Location = new Point(20, 20), AutoSize = true };
            cmbProduct = new ComboBox() { Location = new Point(140, 20), Width = 300, DropDownStyle = ComboBoxStyle.DropDownList };

            Label lblQuantity = new Label() { Text = "Sale Qty:", Location = new Point(20, 60), AutoSize = true };
            txtSaleQuantity = new NumericUpDown() { Location = new Point(140, 60), Width = 100, Minimum = 1, Maximum = 100000 };

            Button btnRecord = new Button() { Text = "Record Sale", Location = new Point(140, 100), Width = 100 };
            btnRecord.Click += BtnRecordSale_Click;

            Button btnUpdate = new Button() { Text = "Update Sale", Location = new Point(250, 100), Width = 100 };
            btnUpdate.Click += BtnUpdate_Click;

            Button btnClear = new Button() { Text = "Clear", Location = new Point(360, 100), Width = 100 };
            btnClear.Click += (s, e) => ClearForm();

            dgvSales = new DataGridView() {
                Location = new Point(20, 150),
                Size = new Size(740, 380),
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                ReadOnly = true,
                AllowUserToAddRows = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
            };
            dgvSales.CellClick += DgvSales_CellClick;

            this.Controls.Add(lblProduct);
            this.Controls.Add(cmbProduct);
            this.Controls.Add(lblQuantity);
            this.Controls.Add(txtSaleQuantity);
            this.Controls.Add(btnRecord);
            this.Controls.Add(btnUpdate);
            this.Controls.Add(btnClear);
            this.Controls.Add(dgvSales);
        }

        private void LoadProducts()
        {
            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT prodID, prodName + ' (Stock: ' + CAST(quantity AS VARCHAR(10)) + ')' as display, quantity FROM Product", conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        cmbProduct.DisplayMember = "display";
                        cmbProduct.ValueMember = "prodID";
                        cmbProduct.DataSource = dt;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading products: " + ex.Message);
            }
        }

        private void LoadData()
        {
            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    string query = @"
                        SELECT s.salID, s.product as prodID, p.prodName, s.saleDate 
                        FROM Sales s
                        JOIN Product p ON s.product = p.prodID
                        ORDER BY s.saleDate DESC";
                    SqlDataAdapter da = new SqlDataAdapter(query, conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    dgvSales.DataSource = dt;
                    if (dgvSales.Columns.Contains("prodID"))
                        dgvSales.Columns["prodID"].Visible = false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading sales: " + ex.Message);
            }
        }

        private void BtnRecordSale_Click(object sender, EventArgs e)
        {
            if (cmbProduct.SelectedValue == null)
            {
                MessageBox.Show("Please select a product.");
                return;
            }

            int productId = Convert.ToInt32(cmbProduct.SelectedValue);
            int saleQty = (int)txtSaleQuantity.Value;

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    
                    string stockQuery = "SELECT quantity FROM Product WHERE prodID = @id";
                    using (SqlCommand checkCmd = new SqlCommand(stockQuery, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@id", productId);
                        object result = checkCmd.ExecuteScalar();
                        
                        if (result == null)
                        {
                            MessageBox.Show("Product not found.");
                            return;
                        }

                        int currentStock = Convert.ToInt32(result);
                        if (saleQty > currentStock)
                        {
                            MessageBox.Show($"Not enough stock! Available quantity is {currentStock}.", "Warning");
                            return;
                        }

                        SqlTransaction transaction = conn.BeginTransaction();
                        try
                        {
                            string updateStockQuery = "UPDATE Product SET quantity = quantity - @qty WHERE prodID = @id";
                            using (SqlCommand updateCmd = new SqlCommand(updateStockQuery, conn, transaction))
                            {
                                updateCmd.Parameters.AddWithValue("@qty", saleQty);
                                updateCmd.Parameters.AddWithValue("@id", productId);
                                updateCmd.ExecuteNonQuery();
                            }

                            string insertSaleQuery = "INSERT INTO Sales (product) VALUES (@product)";
                            using (SqlCommand insertCmd = new SqlCommand(insertSaleQuery, conn, transaction))
                            {
                                insertCmd.Parameters.AddWithValue("@product", productId);
                                insertCmd.ExecuteNonQuery();
                            }

                            transaction.Commit();
                            MessageBox.Show("Sale recorded successfully.");

                            int newStock = currentStock - saleQty;
                            if (newStock < 5)
                            {
                                MessageBox.Show($"Warning: Stock for this product is getting low! ({newStock} items remaining)", "Low Stock", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                            }

                            ClearForm();
                            LoadProducts();
                            LoadData();
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            MessageBox.Show("Transaction failed: " + ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error recording sale: " + ex.Message);
            }
        }

        private void BtnUpdate_Click(object sender, EventArgs e)
        {
            if (selectedSaleID == 0)
            {
                MessageBox.Show("Please select a sale to update.");
                return;
            }

            int newProductId = Convert.ToInt32(cmbProduct.SelectedValue);

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    SqlTransaction transaction = conn.BeginTransaction();
                    try
                    {
                        // If product was changed, restore stock to old and reduce new
                        if (originalProductID != newProductId)
                        {
                            string restoreOld = "UPDATE Product SET quantity = quantity + 1 WHERE prodID = @oldId";
                            using (SqlCommand cmd = new SqlCommand(restoreOld, conn, transaction))
                            {
                                cmd.Parameters.AddWithValue("@oldId", originalProductID);
                                cmd.ExecuteNonQuery();
                            }

                            string checkNew = "SELECT quantity FROM Product WHERE prodID = @newId";
                            using (SqlCommand cmd = new SqlCommand(checkNew, conn, transaction))
                            {
                                cmd.Parameters.AddWithValue("@newId", newProductId);
                                object res = cmd.ExecuteScalar();
                                if (res != null && Convert.ToInt32(res) < 1)
                                {
                                    throw new Exception("New product does not have enough stock. Cannot switch sale to this product.");
                                }
                            }

                            string reduceNew = "UPDATE Product SET quantity = quantity - 1 WHERE prodID = @newId";
                            using (SqlCommand cmd = new SqlCommand(reduceNew, conn, transaction))
                            {
                                cmd.Parameters.AddWithValue("@newId", newProductId);
                                cmd.ExecuteNonQuery();
                            }
                        }

                        string updateSale = "UPDATE Sales SET product=@product WHERE salID=@salID";
                        using (SqlCommand cmd = new SqlCommand(updateSale, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@product", newProductId);
                            cmd.Parameters.AddWithValue("@salID", selectedSaleID);
                            cmd.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        MessageBox.Show("Sale updated successfully.");
                        ClearForm();
                        LoadProducts();
                        LoadData();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        MessageBox.Show("Update failed: " + ex.Message);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error updating sale: " + ex.Message);
            }
        }

        private void DgvSales_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = dgvSales.Rows[e.RowIndex];
                selectedSaleID = Convert.ToInt32(row.Cells["salID"].Value);
                
                if (row.Cells["prodID"].Value != DBNull.Value)
                {
                    originalProductID = Convert.ToInt32(row.Cells["prodID"].Value);
                    cmbProduct.SelectedValue = originalProductID;
                }
                
                txtSaleQuantity.Value = 1; 
                txtSaleQuantity.Enabled = false; // Disable qty change on update to prevent complex balance math
            }
        }

        private void ClearForm()
        {
            selectedSaleID = 0;
            originalProductID = 0;
            txtSaleQuantity.Value = 1;
            txtSaleQuantity.Enabled = true;
            if (cmbProduct.Items.Count > 0)
                cmbProduct.SelectedIndex = 0;
        }
    }
}
