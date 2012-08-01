namespace buildBluesky
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if(disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
			this.label1 = new System.Windows.Forms.Label();
			this.sourceFolderTB = new System.Windows.Forms.TextBox();
			this.label2 = new System.Windows.Forms.Label();
			this.destFolderTB = new System.Windows.Forms.TextBox();
			this.button1 = new System.Windows.Forms.Button();
			this.SuspendLayout();
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(31, 29);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(73, 13);
			this.label1.TabIndex = 0;
			this.label1.Text = "Source folder:";
			// 
			// sourceFolderTB
			// 
			this.sourceFolderTB.Location = new System.Drawing.Point(34, 46);
			this.sourceFolderTB.Name = "sourceFolderTB";
			this.sourceFolderTB.Size = new System.Drawing.Size(361, 20);
			this.sourceFolderTB.TabIndex = 2;
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(31, 69);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(92, 13);
			this.label2.TabIndex = 0;
			this.label2.Text = "Destination folder:";
			// 
			// destFolderTB
			// 
			this.destFolderTB.Location = new System.Drawing.Point(34, 86);
			this.destFolderTB.Name = "destFolderTB";
			this.destFolderTB.Size = new System.Drawing.Size(361, 20);
			this.destFolderTB.TabIndex = 3;
			// 
			// button1
			// 
			this.button1.Location = new System.Drawing.Point(320, 121);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(75, 23);
			this.button1.TabIndex = 1;
			this.button1.Text = "Build Bluesky";
			this.button1.UseVisualStyleBackColor = true;
			this.button1.Click += new System.EventHandler(this.button1_Click);
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(424, 175);
			this.Controls.Add(this.button1);
			this.Controls.Add(this.destFolderTB);
			this.Controls.Add(this.sourceFolderTB);
			this.Controls.Add(this.label2);
			this.Controls.Add(this.label1);
			this.Name = "Form1";
			this.Text = "Bluesky.js builder";
			this.ResumeLayout(false);
			this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox sourceFolderTB;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox destFolderTB;
        private System.Windows.Forms.Button button1;
    }
}

