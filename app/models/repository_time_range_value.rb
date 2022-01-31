# frozen_string_literal: true

class RepositoryTimeRangeValue < RepositoryDateTimeRangeValueBase
  def data_changed?(new_data)
    data = new_data.is_a?(String) ? JSON.parse(new_data).symbolize_keys : new_data

    st = Time.zone.parse(data[:start_time])
    et = Time.zone.parse(data[:end_time])
    st.hour != start_time.hour || et.hour != end_time.hour || st.min != start_time.min || et.min != end_time.min
  end

  def formatted
    super(:time)
  end

  def self.add_filter_condition(repository_rows, filter_element)
    parameters = filter_element.parameters
    case filter_element.operator
    when 'equal_to'
      repository_rows.where('repository_date_time_range_values.start_time::time = ? AND repository_date_time_range_values.end_time::time = ?',
                            parameters['start_time'], parameters['end_time'])
    when 'unequal_to'
      repository_rows.where.not('repository_date_time_range_values.start_time::time = ? AND repository_date_time_range_values.end_time::time = ?',
                            parameters['start_time'], parameters['end_time'])
    when 'greater_than'
      repository_rows.where('repository_date_time_range_values.start_time::time > ?', parameters['end_datetime'])
    when 'greater_than_or_equal_to'
      repository_rows.where('repository_date_time_range_values.start_time::time >= ?', parameters['end_datetime'])
    when 'less_than'
      repository_rows.where('repository_date_time_range_values.end_time::time < ?', parameters['start_datetime'])
    when 'less_than_or_equal_to'
      repository_rows.where('repository_date_time_range_values.end_time::time <= ?', parameters['start_datetime'])
    when 'between'
      repository_rows.where('repository_date_time_range_values.start_time::time > ? AND repository_date_time_range_values.end_time::time < ?',
                            parameters['start_datetime'], parameters['end_datetime'])
    else
      raise ArgumentError, 'Wrong operator for RepositoryTimeRangeValue!'
    end
  end

  def self.new_with_payload(payload, attributes)
    data = payload.is_a?(String) ? JSON.parse(payload).symbolize_keys : payload

    value = new(attributes)
    value.start_time = Time.zone.parse(data[:start_time])
    value.end_time = Time.zone.parse(data[:end_time])
    value
  end

  alias export_formatted formatted
end
