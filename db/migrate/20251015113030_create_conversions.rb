class CreateConversions < ActiveRecord::Migration[8.0]
  def change
    create_table :conversions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :conversion_type
      t.string :original_file
      t.string :converted_file

      t.timestamps
    end
  end
end
