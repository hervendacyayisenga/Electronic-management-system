using System;
using System.Drawing;
using System.Windows.Forms;

namespace GoDigitalShop
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "GoDigital Shop Management System";
            this.Size = new Size(1024, 768);
            this.IsMdiContainer = true;
            this.StartPosition = FormStartPosition.CenterScreen;

            MenuStrip menuStrip = new MenuStrip();
            ToolStripMenuItem suppliersMenu = new ToolStripMenuItem("Suppliers");
            ToolStripMenuItem productsMenu = new ToolStripMenuItem("Products");
            ToolStripMenuItem salesMenu = new ToolStripMenuItem("Sales");

            suppliersMenu.Click += (s, e) => {
                SupplierForm form = new SupplierForm();
                form.MdiParent = this;
                form.Show();
            };

            productsMenu.Click += (s, e) => {
                ProductForm form = new ProductForm();
                form.MdiParent = this;
                form.Show();
            };

            salesMenu.Click += (s, e) => {
                SalesForm form = new SalesForm();
                form.MdiParent = this;
                form.Show();
            };

            menuStrip.Items.AddRange(new ToolStripItem[] { suppliersMenu, productsMenu, salesMenu });
            this.MainMenuStrip = menuStrip;
            this.Controls.Add(menuStrip);
        }
    }
}
