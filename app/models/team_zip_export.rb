require 'zip'
require 'fileutils'
require 'csv'

class TeamZipExport < ZipExport
  has_attached_file :zip_file,
                    path: '/zip_exports/:attachment/:id_partition/' \
                          ':hash/:style/:filename'
  validates_attachment :zip_file,
                       content_type: { content_type: 'application/zip' }

  # Length of allowed name size
  MAX_NAME_SIZE = 20

  def generate_exportable_zip(user, data, type, options = {})
    @user = user
    FileUtils.mkdir_p(File.join(Rails.root, 'tmp/zip-ready'))
    dir_to_zip = FileUtils.mkdir_p(
      File.join(Rails.root, "tmp/temp-zip-#{Time.now.to_i}")
    ).first
    output_file = File.new(
      File.join(Rails.root,
                "tmp/zip-ready/projects_export-timestamp-#{Time.now.to_i}.zip"),
      'w+')
    fill_content(dir_to_zip, data, type, options)
    zip!(dir_to_zip, output_file.path)
    self.zip_file = File.open(output_file)
    generate_notification(user) if save
  end

  handle_asynchronously :generate_exportable_zip

  private

  # Export all functionality
  def generate_teams_zip(tmp_dir, data, options = {})
    # Create team folder
    @team = options[:team]
    team_path = "#{tmp_dir}/#{handle_name(@team.name)}"
    FileUtils.mkdir_p(team_path)

    # Create Projects folders
    FileUtils.mkdir_p("#{team_path}/Projects")
    FileUtils.mkdir_p("#{team_path}/Archived projects")

    # Iterate through every project
    data.each_with_index do |(_, p), ind|
      project_name = handle_name(p.name) + "_#{ind}"
      root =
        if p.archived
          "#{team_path}/Archived projects"
        else
          "#{team_path}/Projects"
        end
      root += "/#{project_name}"
      FileUtils.mkdir_p(root)

      FileUtils.touch("#{root}/#{project_name}_REPORT.pdf").first

      inventories = "#{root}/Inventories"
      FileUtils.mkdir_p(inventories)

      # Find all assigned inventories through all tasks in the project
      task_ids = p.project_my_modules
      repo_rows = RepositoryRow.joins(:my_modules)
                               .where(my_modules: { id: task_ids })
                               .distinct

      # Iterate through every inventory repo and save it to CSV
      repo_rows.map(&:repository).uniq.each_with_index do |repo, repo_ind|
        curr_repo_rows = repo_rows.select { |x| x.repository_id == repo.id }
        save_inventories_to_csv(inventories, repo, curr_repo_rows, repo_ind)
      end

      # Include all experiments
      p.experiments.each_with_index do |ex, ex_ind|
        experiment_path = "#{root}/#{handle_name(ex.name)}_#{ex_ind}"
        FileUtils.mkdir_p(experiment_path)

        # Include all modules
        ex.my_modules.each_with_index do |my_module, mod_ind|
          my_module_path = "#{experiment_path}/" \
            "#{handle_name(my_module.name)}_#{mod_ind}"
          FileUtils.mkdir_p(my_module_path)

          # Create upper directories for both elements
          protocol_path = "#{my_module_path}/Protocol attachments"
          result_path = "#{my_module_path}/Result attachments"
          FileUtils.mkdir_p(protocol_path)
          FileUtils.mkdir_p(result_path)

          # Export protocols
          steps = my_module.protocols.map(&:steps).flatten
          export_step_assets(StepAsset.where(step: steps), protocol_path)
          export_step_tables(StepTable.where(step: steps), protocol_path)

          # Export results
          export_result_assets(ResultAsset.where(result: my_module.results)
                                    .map(&:asset), result_path)
          export_result_tables(ResultTable.where(result: my_module.results)
                                    .map(&:table), result_path)
        end
      end
    end
  end

  def generate_notification(user)
    notification = Notification.create(
      type_of: :deliver,
      title: I18n.t('zip_export.notification_title'),
      message:  "<a data-id='#{id}' " \
                "href='#{Rails.application
                              .routes
                              .url_helpers
                              .zip_exports_download_export_all_path(self)}'>" \
                "#{zip_file_file_name}</a>"
    )
    UserNotification.create(notification: notification, user: user)
  end

  def handle_name(name)
    # Handle reserved directories
    if name == '..'
      return '__'
    elsif name == '.'
      return '.'
    end

    # Truncate and replace reserved characters
    name = name[0, MAX_NAME_SIZE].gsub(%r{[*":<>?/\\|~]}, '_')

    # Remove control characters
    name = name.chars.map(&:ord).select { |s| (s > 31 && s < 127) || s > 127 }
               .pack('U*')

    # Remove leading hyphens, trailing dots/spaces
    name.gsub(/^-|\.+$| +$/, '_')
  end

  # Appends given suffix to file_name and then adds original extension
  def append_suffix(file_name, suffix)
    ext = File.extname(file_name)
    File.basename(file_name, ext) + suffix + ext
  end

  # Helper method to extract given assets to the directory
  def export_result_assets(assets, directory)
    assets.each_with_index do |asset, i|
      file = FileUtils.touch("#{directory}/#{append_suffix(asset.file_file_name,
                                                           "_#{i}")}").first
      File.open(file, 'wb') { |f| f.write(asset.open.read) }
    end
  end

  # Helper method to extract given step assets to the directory
  def export_step_assets(assets, directory)
    assets.each_with_index do |step_asset, i|
      asset = step_asset.asset
      file = FileUtils.touch(
        "#{directory}/" \
        "#{append_suffix(asset.file_file_name,
                         "_#{i}_Step#{step_asset.step.position + 1}")}"
      ).first
      File.open(file, 'wb') { |f| f.write(asset.open.read) }
    end
  end

  # Helper method to extract given tables to the directory
  def export_step_tables(step_tables, directory)
    step_tables.each_with_index do |step_table, i|
      table = step_table.table
      table_name = table.name.presence || 'Table'
      table_name += i.to_s
      file = FileUtils.touch(
        "#{directory}/#{handle_name(table_name)}" \
        "_#{i}_Step#{step_table.step.position + 1}.csv"
      ).first
      File.open(file, 'wb') { |f| f.write(table.to_csv) }
    end
  end

  # Helper method to extract given tables to the directory
  def export_result_tables(tables, directory)
    tables.each_with_index do |table, i|
      table_name = table.name.presence || 'Table'
      table_name += i.to_s
      file = FileUtils.touch("#{directory}/#{handle_name(table_name)}.csv")
                      .first
      File.open(file, 'wb') { |f| f.write(table.to_csv) }
    end
  end

  # Helper method for saving inventories to CSV
  def save_inventories_to_csv(path, repo, repo_rows, id)
    repo_name = handle_name(repo.name) + "_#{id}"
    file = FileUtils.touch("#{path}/#{repo_name}.csv").first

    # Attachment folder
    rel_attach_path = "#{repo_name}_ATTACHMENTS"
    attach_path = "#{path}/#{rel_attach_path}"
    FileUtils.mkdir_p(attach_path)

    # Define headers and columns IDs
    col_ids = [-3, -4, -5, -6] + repo.repository_columns.map(&:id)

    # Define callback function for file name
    assets = {}
    asset_counter = 0
    handle_name_func = lambda do |asset|
      file_name = append_suffix(asset.file_file_name, "_#{asset_counter}").to_s

      # Save pair for downloading it later
      assets[asset] = "#{attach_path}/#{file_name}"

      asset_counter += 1
      rel_path = "#{rel_attach_path}/#{file_name}"
      return "=HYPERLINK(\"#{rel_path}\", \"#{rel_path}\")"
    end

    # Generate CSV
    csv_data = RepositoryZipExport.to_csv(repo_rows, col_ids, @user, @team,
                                          handle_name_func)
    File.open(file, 'wb') { |f| f.write(csv_data) }

    # Save all attachments (it doesn't work directly in callback function
    assets.each do |asset, asset_path|
      file = FileUtils.touch(asset_path).first
      File.open(file, 'wb') { |f| f.write asset.open.read }
    end
  end

  # Recursive zipping
  def zip!(input_dir, output_file)
    files = Dir.entries(input_dir)
    files.delete_if { |el| el == '..' || el == '.' }
    Zip::File.open(output_file, Zip::File::CREATE) do |zipfile|
      write_entries(input_dir, files, '', zipfile)
    end
  end

  # Zip the input directory.
  def write
    entries = Dir.entries(@inputDir)
    entries.delete('.')
    entries.delete('..')

    io = Zip::File.open(@outputFile, Zip::File::CREATE)
    write_entries(entries, '', io)
    io.close
  end

  # A helper method to make the recursion work.
  def write_entries(input_dir, entries, path, io)
    entries.each do |e|
      zip_file_path = path == '' ? e : File.join(path, e)
      disk_file_path = File.join(input_dir, zip_file_path)
      puts 'Deflating ' + disk_file_path
      if File.directory?(disk_file_path)
        io.mkdir(zip_file_path)
        subdir = Dir.entries(disk_file_path)
        subdir.delete('.')
        subdir.delete('..')

        write_entries(input_dir, subdir, zip_file_path, io)
      else
        io.get_output_stream(zip_file_path) do |f|
          f.puts File.open(disk_file_path, 'rb').read
        end
      end
    end
  end
end
