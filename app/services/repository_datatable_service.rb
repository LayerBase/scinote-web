class RepositoryDatatableService

  attr_reader :repository_rows, :assigned_rows

  def initialize(repository, params, mappings, user, my_module = nil)
    @mappings = mappings
    @repository = repository
    @mappings = mappings
    @user = user
    @my_module = my_module
    @params = params
    process_query
  end

  private

  def process_query
    contitions = build_conditions(@params)
    order_obj = contitions[:order_by_column]
    search_value = contitions[:search_value]
    if search_value.present?
      @repository_rows = sort_rows(order_obj, search(search_value))
    else
      @repository_rows = sort_rows(order_obj, fetch_records)
    end
  end

  def fetch_records
    repository_rows = RepositoryRow.preload(:repository_columns,
                                            :created_by,
                                            repository_cells: :value)
                                   .joins(:created_by)
                                   .where(repository: @repository)
    if @my_module
      @assigned_rows = @my_module.repository_rows
                                 .preload(
                                   :repository_columns,
                                   :created_by,
                                   repository_cells: :value
                                 )
                                 .joins(:created_by)
                                 .where(repository: @repository)
      return @assigned_rows if @params[:assigned] == 'assigned'
    else
      @assigned_rows = repository_rows.joins(
        'INNER JOIN my_module_repository_rows ON
        (repository_rows.id = my_module_repository_rows.repository_row_id)'
      )
    end
    repository_rows
  end

  def search(value)
    includes_json = {
      repository_cells: [:repository_text_value,
                         repository_list_value: :repository_list_item ]
    }
    RepositoryRow .left_outer_joins(:created_by)
                  .left_outer_joins(includes_json)
                  .where(repository: @repository)
                  .where_attributes_like(
                    ['repository_rows.name',
                     'users.full_name',
                     'repository_text_values.data',
                     'repository_list_items.data'],
                    value
                  )
  end

  def build_conditions(params)
    search_value = params[:search][:value]
    order = params[:order].values.first
    order_by_column = { column: order[:column].to_i,
                        dir: order[:dir] }
    { search_value: search_value, order_by_column: order_by_column }
  end

  def sortable_columns
    array = [
      'assigned',
      'repository_rows.name',
      'repository_rows.created_at',
      'users.full_name'
    ]
    @repository.repository_columns.count.times do
      array << 'repository_cell.value'
    end
    array
  end

  def sort_rows(column_obj, records)
    dir = %w[DESC ASC].find { |dir| dir == column_obj[:dir].upcase } || 'ASC'
    column_index = column_obj[:column]
    col_order = @repository.repository_table_states
                           .find_by_user_id(@user.id)
                           .state['ColReorder']
    column_id = col_order[column_index].to_i

    if sortable_columns[column_id - 1] == 'assigned'
      return records if @my_module && @params[:assigned] == 'assigned'
      if @my_module
        # Depending on the sort, order nulls first or
        # nulls last on repository_cells association
        return records.joins(
          "LEFT OUTER JOIN my_module_repository_rows ON
          (repository_rows.id = my_module_repository_rows.repository_row_id
          AND (my_module_repository_rows.my_module_id = #{@my_module.id} OR
                            my_module_repository_rows.id IS NULL))"
        ).order(
          "my_module_repository_rows.id NULLS #{sort_null_direction(dir)}"
        )
      else
        return sort_assigned_records(records, dir)
      end
    elsif sortable_columns[column_id - 1] == 'repository_cell.value'
      id = @mappings.key(column_id.to_s)
      type = RepositoryColumn.find_by_id(id)
      return records unless type
      return select_type(type.data_type, records, id, dir)
    else
      return records.order("#{sortable_columns[column_id - 1]} #{dir}")
    end
  end

  def sort_assigned_records(records, direction)
    assigned = records.joins(:my_module_repository_rows).distinct.pluck(:id)
    unassigned = records.where.not(id: assigned).pluck(:id)
    if direction == 'ASC'
      ids = assigned + unassigned
    elsif direction == 'DESC'
      ids = unassigned + assigned
    end

    order_by_index = ActiveRecord::Base.send(
      :sanitize_sql_array,
      ["position((',' || repository_rows.id || ',') in ?)",
       ids.join(',') + ',']
    )
    records.order(order_by_index)
  end

  def select_type(type, records, id, dir)
    return filter_by_text_value(
      records, id, dir) if type == 'RepositoryTextValue'
    return filter_by_list_value(
      records, id, dir) if type == 'RepositoryListValue'
  end

  def sort_null_direction(val)
    val == 'ASC' ? 'LAST' : 'FIRST'
  end

  def filter_by_text_value(records, id, dir)
    return records.joins(
      "LEFT OUTER JOIN (SELECT repository_cells.repository_row_id,
        repository_text_values.data AS value
      FROM repository_cells
      INNER JOIN repository_text_values
      ON repository_text_values.id = repository_cells.value_id
      WHERE repository_cells.repository_column_id = #{id}) AS values
      ON values.repository_row_id = repository_rows.id"
    ).order("values.value #{dir}")
  end

  def filter_by_list_value(records, id, dir)
    return records.joins(
      "LEFT OUTER JOIN (SELECT repository_cells.repository_row_id,
        repository_list_items.data AS value
      FROM repository_cells
      INNER JOIN repository_list_values
      ON repository_list_values.id = repository_cells.value_id
      INNER JOIN repository_list_items
      ON repository_list_values.repository_list_item_id =
      repository_list_items.id
      WHERE repository_cells.repository_column_id = #{id}) AS values
      ON values.repository_row_id = repository_rows.id"
    ).order("values.value #{dir}")
  end
end
