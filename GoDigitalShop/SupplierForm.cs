using System;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Windows.Forms;

namespace GoDigitalShop
{
    public partial class SupplierForm : Form
    {
        private TextBox txtSuppName;
        private TextBox txtCountry;
        private TextBox txtSuppEmail;
        private DataGridView dgvSuppliers;
        private int selectedSuppID = 0;
        private DbConnection db = new DbConnection();

        public SupplierForm()
        {
            InitializeComponent();
            LoadData();
        }

        private void InitializeComponent()
        {
            this.Text = "Manage Suppliers";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;

            Label lblName = new Label() { Text = "Supplier Name:", Location = new Point(20, 20), AutoSize = true };
            txtSuppName = new TextBox() { Location = new Point(140, 20), Width = 200 };

            Label lblCountry = new Label() { Text = "Country:", Location = new Point(20, 60), AutoSize = true };
            txtCountry = new TextBox() { Location = new Point(140, 60), Width = 200 };

            Label lblEmail = new Label() { Text = "Email:", Location = new Point(20, 100), AutoSize = true };
            txtSuppEmail = new TextBox() { Location = new Point(140, 100), Width = 200 };

            Button btnSave = new Button() { Text = "Save", Location = new Point(140, 140) };
            btnSave.Click += BtnSave_Click;

            Button btnUpdate = new Button() { Text = "Update", Location = new Point(240, 140) };
            btnUpdate.Click += BtnUpdate_Click;
            
            Button btnClear = new Button() { Text = "Clear", Location = new Point(340, 140) };
            btnClear.Click += (s, e) => ClearForm();

            dgvSuppliers = new DataGridView() {
                Location = new Point(20, 180),
                Size = new Size(740, 350),
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                ReadOnly = true,
                AllowUserToAddRows = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
            };
            dgvSuppliers.CellClick += DgvSuppliers_CellClick;

            this.Controls.Add(lblName);
            this.Controls.Add(txtSuppName);
            this.Controls.Add(lblCountry);
            this.Controls.Add(txtCountry);
            this.Controls.Add(lblEmail);
            this.Controls.Add(txtSuppEmail);
            this.Controls.Add(btnSave);
            this.Controls.Add(btnUpdate);
            this.Controls.Add(btnClear);
            this.Controls.Add(dgvSuppliers);
        }

        private void LoadData()
        {
            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT suppID, suppName, country, suppEmail FROM Supplier", conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    dgvSuppliers.DataSource = dt;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading suppliers: " + ex.Message);
            }
        }

        private void BtnSave_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtSuppName.Text) || string.IsNullOrWhiteSpace(txtCountry.Text))
            {
                MessageBox.Show("Supplier Name and Country are required.");
                return;
            }

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    string query = "INSERT INTO Supplier (suppName, country, suppEmail) VALUES (@name, @country, @email)";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", txtSuppName.Text);
                        cmd.Parameters.AddWithValue("@country", txtCountry.Text);
                        cmd.Parameters.AddWithValue("@email", txtSuppEmail.Text);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Supplier saved successfully.");
                    ClearForm();
                    LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error saving supplier: " + ex.Message);
            }
        }

        private void BtnUpdate_Click(object sender, EventArgs e)
        {
            if (selectedSuppID == 0)
            {
                MessageBox.Show("Please select a supplier to update.");
                return;
            }

            try
            {
                using (var conn = db.GetConnection())
                {
                    conn.Open();
                    string query = "UPDATE Supplier SET suppName=@name, country=@country, suppEmail=@email WHERE suppID=@id";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@name", txtSuppName.Text);
                        cmd.Parameters.AddWithValue("@country", txtCountry.Text);
                        cmd.Parameters.AddWithValue("@email", txtSuppEmail.Text);
                        cmd.Parameters.AddWithValue("@id", selectedSuppID);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Supplier updated successfully.");
                    ClearForm();
                    LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error updating supplier: " + ex.Message);
            }
        }

        private void DgvSuppliers_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = dgvSuppliers.Rows[e.RowIndex];
                selectedSuppID = Convert.ToInt32(row.Cells["suppID"].Value);
                txtSuppName.Text = row.Cells["suppName"].Value?.ToString();
                txtCountry.Text = row.Cells["country"].Value?.ToString();
                txtSuppEmail.Text = row.Cells["suppEmail"].Value?.ToString();
            }
        }

        private void ClearForm()
        {
            selectedSuppID = 0;
            txtSuppName.Clear();
            txtCountry.Clear();
            txtSuppEmail.Clear();
        }
    }
}
