class AddVisitorTokenAndGuestToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :visitor_token, :string
    add_index :users, :visitor_token, unique: true
    add_column :users, :guest, :boolean
  end
end
