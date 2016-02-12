module DatabaseHelper

  # Check if database adapter equals to the specified name
  def db_adapter_is?(adapter_name)
    ActiveRecord::Base.connection.adapter_name == adapter_name
  end

  # Create PostgreSQL extension. PostgreSQL only!
  def create_extension(ext_name)
    ActiveRecord::Base.connection.execute(
      "CREATE EXTENSION #{ext_name};"
    )
  end

  # Drop PostgreSQL extension. PostgreSQL only!
  def drop_extension(ext_name)
    ActiveRecord::Base.connection.execute(
      "DROP EXTENSION #{ext_name};"
    )
  end

  # Create gist trigram index. PostgreSQL only!
  def add_gist_index(table, column)
    ActiveRecord::Base.connection.execute(
      "CREATE INDEX index_#{table}_on_#{column} ON " +
      "#{table} USING gist (#{column} gist_trgm_ops);"
    )
  end

  # Get size of whole table & its indexes
  # (in bytes). PostgreSQL only!
  def get_table_size(table)
    ActiveRecord::Base.connection.execute(
      "SELECT pg_total_relation_size('#{table}');"
    ).getvalue(0, 0).to_i
  end

  # Get octet length (in bytes) of given column
  # of specified SINGLE ActiveRecord. PostgreSQL only!
  def get_octet_length_record(object, column)
    get_octet_length(
      object.class.to_s.tableize,
      column,
      object.id
    )
  end

  # Get octet length (in bytes) of given column
  # in table for specific id. PostgreSQL only!
  def get_octet_length(table, column, id)
    ActiveRecord::Base.connection.execute(
      "SELECT octet_length(cast(t.#{column} as text)) FROM #{table} " +
      "AS t WHERE t.id = #{id};"
    ).getvalue(0, 0).to_i
  end

end