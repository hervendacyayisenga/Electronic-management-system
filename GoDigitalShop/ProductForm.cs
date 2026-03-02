using System;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Windows.Forms;

namespace GoDigitalShop
{
    public partial class ProductForm : Form
    {
        private TextBox txtProdName;
        private ComboBox cmbSupplier;
        private NumericUpDown txtQuantity;
        private TextBox txtPrice;
        private DataGridView dgvProducts;
        private int selectedProdID = 0;
        private DbConnection db = new DbConnection();

        public ProductForm()
        {
            InitializeComponent();
            LoadSuppliers();
            LoadData();
        }

        private void InitializeComponent()
        {
            this.Text = "Manage Products";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;

            Label lblName = new Label() { Text = "Product Name:", Location = new Point(20, 20), AutoSize = true };
            txtProdName = new TextBox() { Location = new Point(140, 20), Width = 200 };

            Label lblSupplier = new Label() { Text = "Supplier:", Location = new Point(20, 60), AutoSize = true };
            cmbSupplier = new ComboBox() { Location = new Point(140, 60), Width = 200, DropDownStyle = ComboBoxStyle.DropDownList };

            Label lblQuantity = new Label() { Text = "Quantity:", Location = new Point(20, 100), AutoSize = true };
            txtQuantity = new NumericUpDown() { Location = new Point(140, 100), Width = 200, Maximum = 100000, Minimum = 0 };

            Label lblPrice = new Label() { Text = "Price:", Location = new Point(20, 140), AutoSize = true };
            txtPrice = new TextBox() { Location = new Point(140, 140), Width = 200 };

            Button btnSave = new Button() { Text = "Save", Location = new Point(140, 180) };
            btnSave.Click += BtnSave_Click;

            Button btnUpdate = new Button() { Text = "Update", Location = new Point(240, 180) };
            btnUpdate.Click += BtnUpdate_Click;
            
            Button btnClear = new Button() { Text = "Clear", Location = new Point(340, 180) };
            btnClear.Click += (s, e) => ClearForm();

            dgvProducts = new DataGridView() {
                Location = new Point(20, 220),
                Size = new Size(740, 310),
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                ReadOnly = true,
                AllowUserToAddRows = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
            };
            dgvProducts.CellClick += DgvProducts_CellClick;

            this.Controls.Add(lblName);
            this.Controls.Add(txtProdName);
            this.Controls.Add(lblSupplier);
            this.Controls.Add(cmbSupplier);
            this.Controls.Add(lblQuantity);
            this.Controls.Add(txtQuantity);
            this.Controls.Add(lblPrice);
            this.Controls.Add(txtPrice);
            this.Controls.Add(btnSave);
            this.Controls.Add(btnUpdate);
            this.Controls.Add(btnClear);
            this.Controls.Add(dgvProducts);
        }

        private void LoadSuppliers()
        {
            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT suppID, suppName FROM Supplier", conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        cmbSupplier.DisplayMember = "suppName";
                        cmbSupplier.ValueMember = "suppID";
                        cmbSupplier.DataSource = dt;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading suppliers: " + ex.Message);
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
                        SELECT p.prodID, p.prodName, p.supplier as suppID, s.suppName, p.quantity, p.price, p.registeredDate 
                        FROM Product p 
                        JOIN Supplier s ON p.supplier = s.suppID";
                    SqlDataAdapter da = new SqlDataAdapter(query, conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    dgvProducts.DataSource = dt;
                    if (dgvProducts.Columns.Contains("suppID"))
                        dgvProducts.Columns["suppID"].Visible = false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading products: " + ex.Message);
            }
        }

        private void BtnSave_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtProdName.Text) || cmbSupplier.SelectedValue == null || string.IsNullOrWhiteSpace(txtPrice.Text))
            {
                MessageBox.Show("Product Name, Supplier, and Price are required.");
                return;
            }

            if (!decimal.TryParse(txtPrice.Text, out decimal price))
            {
                MessageBox.Show("Invalid price format.");
                return;
            }

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    string query = "INSERT INTO Product (prodName, supplier, quantity, price) VALUES (@name, @supplier, @quantity, @price)";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", txtProdName.Text);
                        cmd.Parameters.AddWithValue("@supplier", cmbSupplier.SelectedValue);
                        cmd.Parameters.AddWithValue("@quantity", txtQuantity.Value);
                        cmd.Parameters.AddWithValue("@price", price);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Product saved successfully.");
                    ClearForm();
                    LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error saving product: " + ex.Message);
            }
        }

        private void BtnUpdate_Click(object sender, EventArgs e)
        {
            if (selectedProdID == 0)
            {
                MessageBox.Show("Please select a product to update.");
                return;
            }

            if (!decimal.TryParse(txtPrice.Text, out decimal price))
            {
                MessageBox.Show("Invalid price format.");
                return;
            }

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    string query = "UPDATE Product SET prodName=@name, supplier=@supplier, quantity=@quantity, price=@price WHERE prodID=@id";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", txtProdName.Text);
                        cmd.Parameters.AddWithValue("@supplier", cmbSupplier.SelectedValue);
                        cmd.Parameters.AddWithValue("@quantity", txtQuantity.Value);
                        cmd.Parameters.AddWithValue("@price", price);
                        cmd.Parameters.AddWithValue("@id", selectedProdID);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Product updated successfully.");
                    ClearForm();
                    LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error updating product: " + ex.Message);
            }
        }

        private void DgvProducts_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = dgvProducts.Rows[e.RowIndex];
                selectedProdID = Convert.ToInt32(row.Cells["prodID"].Value);
                txtProdName.Text = row.Cells["prodName"].Value?.ToString();
                
                if (row.Cells["suppID"].Value != DBNull.Value)
                    cmbSupplier.SelectedValue = row.Cells["suppID"].Value;
                
                txtQuantity.Value = Convert.ToInt32(row.Cells["quantity"].Value);
                txtPrice.Text = row.Cells["price"].Value?.ToString();
            }
        }

        private void ClearForm()
        {
            selectedProdID = 0;
            txtProdName.Clear();
            txtQuantity.Value = 0;
            txtPrice.Clear();
            if (cmbSupplier.Items.Count > 0)
                cmbSupplier.SelectedIndex = 0;
        }
    }
}
