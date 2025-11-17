class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :session_id
      t.string :nickname
      t.string :email
      t.integer :remaining_coupons

      t.timestamps
    end
  end
end
